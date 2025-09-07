import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

export interface IProductColorVariant
  extends Pick<IProduct, 'id' | 'key' | 'title' | 'sku' | 'slug' | 'status' | 'baseColorCode'> {
  image: string | undefined;
}
