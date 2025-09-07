import { type ICommercePrice } from '@/src/lib/framework/Commerce/domain/entities/ICommercePrice';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

export interface IProductVariant extends Pick<IProduct, 'id' | 'title'> {
  sku: string;
  variant: string;
  ean: string;
  order: number;
  size: string | undefined;

  price: ICommercePrice | undefined;
  stock: ICommerceStock | undefined;
}
