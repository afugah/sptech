import { type CustomAttributes, type Tags, type Translations } from './common';

export interface ShopperCart {
  id: string;
  storeGroupId: string;
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  isTaxIncludedInPrice: boolean;
  discountCodes: CartDiscountCode[];
  discountExternals: DiscountExternal[];
  discountAmount: number;
  created: Date;
  updated: Date;
  revision: number;
  sessionId: string;
  items: ShopperCartItem[];
  totals: ShopperCartTotals;
}

export interface CartDiscountCode {
  code: string;
  applyLast: boolean;
  isExclusive: boolean;
}

export interface DiscountExternal {
  applyLast: boolean;
  currencyCode: string;
  discountAmount: number;
  discountExternalRuleId: string;
  freeShipping: boolean;
  isExclusive: boolean;
  name: string;
  provider: string;
  reference: string;
}

export interface ShopperCartTotals {
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface ShopperCheckoutTotals {
  subTotal: number;
  discountTotal: number;
  shippingTotal: number;
  giftCardTotal: number;
  voucherTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export interface ShopperCartItem {
  id: string;
  productVariantId: string;
  productParentId: string;
  quantity: number;
  name: string;
  displayName: string;
  displayNames: Translations;
  description: string;
  displayDescriptions: Translations;
  taxGroupId: string;
  basePriceAmount: number;
  salePriceAmount: number;
  discountAmount: number;
  totalDiscountAmount: number;
  totalPriceAmount: number;
  taxPercentage: number;
  taxPercentageDecimals: number;
  totalTaxAmount: number;
  imageUrl: string;
  slug: string;
  customAttributes: CustomAttributes;
  tags: Tags;
  created: Date;
  updated: Date;
  revision: 1;
}

export interface ShopperVoyadoVoucher {
  amount: number;
  description: string;
  id: string;
  provider: string;
}

export interface ShopperCartGift {
  id: string;
  productVariantId: string;
  productParentId: string;
  quantity: number;
  name: string;
  displayNames: Translations;
  description: string;
  displayDescriptions: Translations;
  imageUrl: string;
  customAttributes: CustomAttributes;
}

export interface ShopperCapabilities {
  paymentProviders: ShopperCapabilitiesProvider[];
  shippingProviders: ShopperCapabilitiesProvider[];
  giftCardProviders: ShopperCapabilitiesProvider[];
  voucherProviders: ShopperCapabilitiesProvider[];
}

export interface ShopperCapabilitiesProvider {
  id: string;
  name: string;
}

export interface ShopperCheckout {
  id: string;
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  isTaxIncludedInPrice: true;
  discountCodes: CartDiscountCode[];
  discountExternals: DiscountExternal[];
  capabilities: ShopperCheckoutCapabilities;
  giftCards: ShopperGiftCardItem[];
  vouchers: ShopperVoucher[];
  items: ShopperItem[];
  totals: ShopperCheckoutTotals;
}

export interface ShopperCheckoutCapabilities {
  paymentProvider: ShopperCheckoutCapabilityProvider;
  shippingProvider: ShopperCheckoutCapabilityProvider;
  giftCardProvider: ShopperCheckoutCapabilityProvider;
  voucherProvider: ShopperCheckoutCapabilityProvider;
}

export interface ShopperCheckoutCapabilityProvider {
  id: string;
  name: string;
  config?: ShopperCheckoutCapabilityProviderConfig;
}

export interface ShopperCheckoutCapabilityProviderConfig {
  [key: string]: string;
}

export interface ShopperGiftCardItem {
  id: string;
  amount: number;
  name: string;
}

export interface ShopperVoucher {
  id: string;
  description: string;
  amount: number;
}

export interface ShopperItem {
  id: string;
  productVariantId: string;
  productParentId: string;
  quantity: number;
  name: string;
  displayName: string;
  description: string;
  displayDescription: string;
  taxGroupId: string;
  basePriceAmount: number;
  salePriceAmount: number;
  discountAmount: number;
  discountOutcome: {
    bundles: [];
    codeRules: [];
    cartRules: [];
    externalRules: [];
    totalDiscountAmount: number;
  };
  taxPercentage: number;
  taxPercentageDecimals: number;
  imageUrl: string;
  customAttributes: CustomAttributes;
  tags: {
    lists: string[];
  };
  options: { key: string; value: string }[];
  created: string;
  updated: string;
  revision: number;
  totalDiscountAmount: number;
  totalPriceAmount: number;
  totalTaxAmount: number;
}

export interface ShopperPurchase {
  transaction_id: string;
  value: number;
  tax: number;
  currency: string;
  coupon?: CartDiscountCode;
  items: TransactionItem[];
  shipping: number;
}

export interface TransactionItem {
  item_id: string;
  item_name: string;
  coupon?: CartDiscountCode;
  discount: number;
  index: number;
  item_category: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_brand?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  customAttributes: CustomAttributes;
}
export interface CartProviders {
  voyado: { additional: { contactId: string }; provider: { id: string; name: string } };
}

export interface ShopperSessionResponse {
  token: string;
  cart: ShopperCart;
  capabilities?: ShopperCapabilities;
  checkout?: ShopperCheckout;
  cartCapabilities?: { voyado: { id: string } };
  cartProviders?: CartProviders;
  vouchers: ShopperVoyadoVoucher[];
  giftCardProducts: ShopperGiftCardItem[];
  outOfStockItems?: string[];
}

export interface ShopperCheckoutResponse {
  token: string;
  checkout: ShopperCheckout;
}

export interface BrinkError {
  requestId: string;
  error: string;
  message: string;
}

export interface RequestSessionStart {
  countryCode: string;
  languageCode: string;
  currencyCode: string;
}

export interface RequestAddItem {
  productVariantId: string;
  quantity: number;
}

export interface RequestUpdateItem {
  itemId: string;
  quantity: number;
}
