'use server';

import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

const take = parseInt(process.env.NEXT_PUBLIC_PRODUCT_TAKE || '20', 10);

export async function getSearchItems(
  marketCode: string,
  q: string,
  filter?: ICollectionSearch.Filter,
  sort?: ICollectionSearch.Sort[],
  page?: number,
) {
  const collectionService = di.resolve(CollectionService);
  const searchValue = decodeURIComponent(q);
  return collectionService.getItemsByQuery(marketCode, searchValue, filter, sort, {
    page,
    take,
  });
}

export async function getSearchAutocomplete(marketCode: string, q: string) {
  const collectionService = di.resolve(CollectionService);
  const searchValue = decodeURIComponent(q);
  return collectionService.getSearchAutocomplete(marketCode, searchValue);
}

export async function getSearchFacets(marketCode: string, q: string) {
  const collectionService = di.resolve(CollectionService);
  const searchValue = decodeURIComponent(q);
  return collectionService.getFacetsBySlugOrQuery(marketCode, searchValue, true);
}
