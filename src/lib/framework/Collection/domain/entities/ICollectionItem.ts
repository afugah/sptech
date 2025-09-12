import { type ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type ProductGroupProduct } from '@/src/types/product';
import { type IFindify } from '../../types/IFindify';

export interface ICollectionItem {
  id: string;
  sku: string;
  key: string;
  title: string;
  display_name: string;
  thumbnail: {
    url: string;
    hoverUrl: string | null | undefined;
  };
  color: string[];
  description?: string;
  status: ProductStatusEnum;
  slug: string;
  slugSv?: string;
  stock: number;
  price: number;
  tags: string[];
  salePrice: number | null;
  compare_at: number | null;
  discount: number | null;
  otherColors: [];
  sizes: { size: string; inStock: boolean }[];
  onlinedate: string | null;
  coming_soon_publish_date: string | null;
  new_until_date: string | null;
  created_at: Date | number;
  pricing: IFindify.PricingStructure;
  custom_fields?: Record<string, string[] | string>;
  productGroupProducts?: ProductGroupProduct[];
}
export interface ICollectionWishlistItem {
  id: string;
  sku: string;
  title: string;
  display_name: string;
  thumbnail: {
    url: string;
    hoverUrl: string | null | undefined;
  };
  description?: string;
  slug: string;
  price: number | undefined;
  tags: string[] | [];
  salePrice?: number | null;
}
