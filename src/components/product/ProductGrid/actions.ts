'use server';

import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
const take = parseInt(process.env.NEXT_PUBLIC_PRODUCT_TAKE || '20', 10);
export async function fetchCategoryItems(
  marketCode: string,
  slug: string | undefined,
  filters?: ICollectionSearch.Filter,
  sort?: ICollectionSearch.Sort[],
  page?: number,
): Promise<ICollectionResponse.Success> {
  if (!slug) throw new Error('[fetchCategoryItems]: `slug` parameter is missing!');
  const collectionService = di.resolve(CollectionService);
  return collectionService.getItemsBySlug(marketCode, slug, filters, sort, {
    page,
    take,
  });
}
