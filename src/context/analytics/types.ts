import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type ShopperCartItem, type ShopperPurchase } from '@/src/lib/types/session';

export type IAnalyticsPayload = { type: string } & (
  | { type: 'view_page'; url: string }
  | { type: 'view_item'; item: IProduct }
  | { type: 'virtual_page_load'; item: IProduct }
  | { type: 'product_detail_view'; item: IProduct }
  | { type: 'add_to_cart'; item: IProduct | ShopperCartItem; item_list_name: string }
  | { type: 'remove_from_cart'; item: IProduct | ShopperCartItem }
  | { type: 'begin_checkout'; item: ShopperCartItem[] }
  | { type: 'checkout'; item: ShopperCartItem[] }
  | { type: 'checkout_option' }
  | { type: 'purchase'; transaction: ShopperPurchase }
  | { type: 'refund'; item: ICollectionItem }
  | { type: 'refund_item'; item: ICollectionItem }
);

export interface IGtmItem {
  item_id: string;
  item_name: string;

  price: number;
  discount: number | null;
  // item_org_price: number | null;
  quantity: number;
  item_brand: string;
  item_list_name?: string | null;
  item_category?: string | null;
  item_category2?: string | null;
  item_category3?: string | null;

  coupon?: string;

  // item_collection: string;

  // item_category: string;
  // item_category2: string;
  // item_category3: string;

  // item_twar: string;
  // item_label: string;
}

export interface IGtmDetailedItem {
  id: string;
  name: string;
  sku: string;

  quantity: number;
  price: number;
  variant: string;
  item_category: string | null;
  item_category2: string | null;
  item_category3: string | null;
  // category: string;
  // brand: string;

  // dimension1?: string;
  // dimension13?: string;
  // dimension14?: string;
  // dimension15?: string;
  // dimension17?: string;
  // dimension18?: string;
}
