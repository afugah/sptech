import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

export const getFiltersParser = (defaultFilters: ICollectionSearch.Filter) => ({
  brand: parseAsArrayOf(parseAsString).withDefault(defaultFilters.brand ?? []),
  color: parseAsArrayOf(parseAsString).withDefault(defaultFilters.color ?? []),
  category: parseAsArrayOf(parseAsString).withDefault(defaultFilters.category ?? []),
  additionalinfo: parseAsArrayOf(parseAsString).withDefault(defaultFilters.additionalinfo ?? []),
  categorycode: parseAsArrayOf(parseAsString).withDefault(defaultFilters.additionalinfo ?? []),
  material: parseAsArrayOf(parseAsString).withDefault(defaultFilters.material ?? []),
  gender: parseAsArrayOf(parseAsString).withDefault(defaultFilters.gender ?? []),

  size: parseAsArrayOf(parseAsString).withDefault(defaultFilters.size ?? []),

  price: parseAsJson<ICollectionSearch.Filter['price']>().withDefault({
    min: defaultFilters.price?.min,
    max: defaultFilters.price?.max,
  }),

  something: parseAsString,
});

export const getSortParser = (defaultSort: ICollectionSearch.Sort) => ({
  field: parseAsString.withDefault(defaultSort.field || ''),
  order: parseAsStringLiteral(['asc', 'desc']).withDefault(defaultSort.order),
});

export const sortCache = createSearchParamsCache(
  getSortParser({
    field: '',
    order: 'asc',
  }),
);
export const getPageParser = (defaultPage: number) => ({
  page: parseAsInteger.withDefault(defaultPage),
});
