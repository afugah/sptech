import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '../types/IElasticSearch';

export interface IProductService {
  getItemBySlug: (locale: string, slug: string) => Promise<IProduct>;
  getItemByID: (locale: string, id: string) => Promise<IProduct>;
  getWarehouses?: () => Promise<IElasticSearch.WareHousesSuccessResponse>;
}
