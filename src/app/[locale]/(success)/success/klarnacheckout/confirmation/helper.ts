import { type FeedbackBody } from '@/src/context/findifyAnalytics/types';
import { type Tags } from '@/src/lib/types/common';
import {
  type CartDiscountCode,
  type ShopperCart,
  type ShopperCartItem,
  type ShopperCheckout,
  type ShopperPurchase,
  type TransactionItem,
} from '@/src/lib/types/session';

export interface KlarnaResponse {
  klarna: {
    order_id: string;
    status: string;
    html_snippet: string;
    started_at: string;
    completed_at: string;
    last_modified_at: string;
    billing_address: Address;
    shipping_address: Address;
  };
  order: {
    id: string;
    reference: string;
  };
  isExpired: boolean;
}

interface Address {
  given_name: string;
  family_name: string;
  organization_name: string;
  street_address: string;
  street_address2: string;
  postal_code: string;
  city: string;
  region: string;
  country: string;
  email: string;
  phone: string;
}

export function transformToTransactionData(
  cart: ShopperCart,
  checkout: ShopperCheckout,
  orderRes: KlarnaResponse,
): ShopperPurchase {
  return {
    transaction_id: orderRes.order.reference,
    value: cart.totals.grandTotal,
    tax: cart.totals.taxTotal,
    currency: cart.currencyCode,
    coupon: cart.discountCodes[0],
    items: cart.items.map((item, index: number) => transformCartItem(item, cart.discountCodes, index)),
    shipping: checkout.totals.shippingTotal || 0,
  };
}

export function transformToFindifyAnalyticsData(
  checkout: ShopperCheckout,
  orderRes: KlarnaResponse,
): FeedbackBody<'purchase'>['properties'] {
  return {
    order_id: orderRes.order.reference,
    currency: checkout.currencyCode,
    revenue: checkout.totals.grandTotal / 100,
    total_tax: checkout.totals.taxTotal / 100,
    total_discount: (checkout.totals.discountTotal || 0) / 100,
    total_shipping: (checkout.totals.shippingTotal || 0) / 100,
    line_items: checkout.items.map((item) => ({
      item_id: item.customAttributes?.findify_id || '',
      variant_item_id: item.customAttributes?.findify_variant_id || '',
      unit_price: ((item.salePriceAmount || item.basePriceAmount) / 100) as number,
      quantity: item.quantity,
    })),
  } as FeedbackBody<'purchase'>['properties'];
}

function transformCartItem(item: ShopperCartItem, discountCodes: CartDiscountCode[], index: number): TransactionItem {
  return {
    item_id: item.customAttributes?.ean || item.productVariantId || '',
    item_name: item.name,
    coupon: discountCodes[0],
    discount: (item.discountAmount || 0) / 100,
    index,
    item_brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
    item_variant: item.productVariantId,
    price: item.totalPriceAmount / 100,
    quantity: item.quantity,
    customAttributes: item.customAttributes,
    ...getCategories(item.tags),
  } as TransactionItem;
}

function getCategories(categories: Tags) {
  const categoriesObj: Record<string, string> = {};
  const collections = categories?.['collections'];
  if (collections && Array.isArray(collections)) {
    collections.forEach((c, i) => {
      if (i === 0) {
        categoriesObj[`item_category`] = c;
      } else {
        categoriesObj[`item_category${i + 1}`] = c;
      }
    });
  }
  return categoriesObj;
}

async function hashData(data: string | undefined | null): Promise<string> {
  if (!data) return '';
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function transformToGTMUserData(orderRes: KlarnaResponse) {
  const billing = orderRes.klarna.billing_address;

  return {
    sha256_email_address: await hashData(billing.email),
    email_address: billing.email,
    sha256_phone_number: await hashData(billing.phone),
    phone_number: billing.phone,
    address: {
      sha256_first_name: await hashData(billing.given_name),
      first_name: billing.given_name,
      sha256_last_name: await hashData(billing.family_name),
      last_name: billing.family_name,
      street: billing.street_address.trim() || '',
      city: billing.city?.trim() || '',
      postal_code: billing.postal_code?.trim() || '',
      country: billing.country?.trim() || '',
    },
  };
}
