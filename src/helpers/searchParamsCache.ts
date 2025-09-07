import { createSearchParamsCache } from 'nuqs/server';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { getFiltersParser, getPageParser, getSortParser } from './searchParams';

// Define default values
const defaultFilters: ICollectionSearch.Filter = {
  brand: [],
  color: [],
  category: [],
  size: [],
  price: { min: 0, max: 50000 },
};

const defaultSort: ICollectionSearch.Sort = {
  field: '',
  order: 'asc',
};

const defaultPage = 0;

// Create the combined cache
export const searchParamsCache = createSearchParamsCache({
  ...getFiltersParser(defaultFilters),
  ...getSortParser(defaultSort),
  ...getPageParser(defaultPage),
});
