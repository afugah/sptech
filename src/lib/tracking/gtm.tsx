'use client';
import { sendGTMEvent } from '@next/third-parties/google';
import { type ShopperItem } from '../types/session';

export const trackPageView = (url: URL) => {
  sendGTMEvent({
    event: 'pageview',
    value: {
      page_path: url,
    },
  });
};

export const trackViewItem = ({ currency, item }: { currency: string; item: ShopperItem }) => {
  sendGTMEvent({
    event: 'view_item',
    value: {
      currency: currency,
      value: item.salePriceAmount / 100,
      items: [ItemToGtagItem(item)],
    },
  });
};

const ItemToGtagItem = (item: ShopperItem): Gtag.Item => {
  return {
    affiliation: process.env.NEXT_PUBLIC_STORE_URL,
    item_id: item.productVariantId,
    item_brand: process.env.NEXT_PUBLIC_STORE_NAME,
    item_category: item.customAttributes?.category,
    item_name: `${item.name}${item.customAttributes.color ? `- ${item.customAttributes.color}` : ''}`,
    price: item.salePriceAmount / 100,
    discount: item.discountAmount,
    quantity: item.quantity,
    //coupon: item.,
  };
};
