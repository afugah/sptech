'use server';

import { di } from '@/src/lib/di';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { ProductService } from '@/src/lib/framework/Product/services/ProductService';

export const getRecommendedItemBySlug = async (locale: string, slug: IProduct['slug']): Promise<IProduct> => {
  const productService = di.resolve(ProductService);
  return productService.getItemBySlug(locale, slug);
};
