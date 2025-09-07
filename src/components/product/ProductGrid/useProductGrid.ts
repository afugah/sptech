import { useQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFiltersParser, getPageParser, getSortParser } from '@/src/helpers/searchParams';
import { useDeepMemo } from '@/src/hooks/useDeepMemo';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { fetchCategoryItems } from './actions';

interface UseFilterProps {
  slug: string;
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
  initialPage: number;
  useViewMore?: boolean;
}

interface UseFilterReturn {
  onPageChange: (page: number) => void;
  productList: ICollectionItem[];
  totalItems: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  sort: ICollectionSearch.Sort;
  onFiltersChange: (filter?: ICollectionSearch.Filter) => void;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  allLoadedItems: ICollectionItem[];
  shownItemsCount: number;
}

export const useProductGrid = ({
  slug,
  defaultFilters,
  defaultSort,
  initialPage,
  useViewMore = false,
}: UseFilterProps): UseFilterReturn => {
  const marketCode = useMarketCode();
  const [queryState, setQueryStates] = useQueryStates(
    {
      ...getFiltersParser(defaultFilters),
      ...getSortParser(defaultSort),
      ...getPageParser(initialPage),
    },
    {
      clearOnDefault: true,
      throttleMs: 200,
    },
  );

  const { brand, category, color, field, order, page: currentPage, price, size } = queryState;

  const filters = useDeepMemo(() => ({ brand, color, category, size, price }), [brand, color, category, size, price]);

  const sort = useDeepMemo(() => ({ field, order }), [field, order]);

  const [allLoadedItems, setAllLoadedItems] = useState<ICollectionItem[]>([]);

  const { data, isFetching } = useQuery({
    queryKey: ['productItems', slug, filters, sort, currentPage - 1],
    queryFn: () => fetchCategoryItems(marketCode, slug, filters, [sort], currentPage - 1),
    staleTime: Infinity,
  });

  const resetAllItems = useCallback(() => {
    setAllLoadedItems([]);
  }, []);

  useEffect(() => {
    if (data?.items && useViewMore) {
      setAllLoadedItems((prev) => {
        if (currentPage === 1) {
          return data.items;
        }
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = data.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    } else if (data?.items && !useViewMore) {
      setAllLoadedItems(data.items);
    }
  }, [data?.items, currentPage, useViewMore]);

  useEffect(() => {
    resetAllItems();
  }, [filters, sort, resetAllItems]);

  const productList = useMemo<ICollectionItem[]>(() => {
    if (useViewMore) {
      return allLoadedItems;
    }
    return data?.items ?? [];
  }, [data, allLoadedItems, useViewMore]);

  const totalItems = data?.pagination?.total?.items ?? 0;
  const totalPages = data?.pagination?.total?.pages ?? 1;
  const shownItemsCount = useViewMore ? allLoadedItems.length : (data?.items?.length ?? 0);

  const onPageChange = useCallback(
    (page: number) => {
      setQueryStates({ page }, { clearOnDefault: false });
      if (!useViewMore) {
        window.scrollTo({ top: 0 });
      }
    },

    [setQueryStates, useViewMore],
  );

  const onSortChange = (newSort?: ICollectionSearch.Sort) => {
    resetAllItems();
    setQueryStates({
      page: 1,
      field: newSort?.field ?? defaultSort?.field ?? '',
      order: newSort?.order ?? defaultSort?.order ?? 'asc',
    });
  };

  const onFiltersChange = (newFilters?: ICollectionSearch.Filter) => {
    resetAllItems();
    setQueryStates({
      page: 1,
      brand: newFilters?.brand ?? defaultFilters?.brand ?? [],
      color: newFilters?.color ?? defaultFilters?.color ?? [],
      category: newFilters?.category ?? defaultFilters?.category ?? [],
      size: newFilters?.size ?? defaultFilters?.size ?? [],
      price: newFilters?.price ?? defaultFilters?.price,
    });
  };

  return {
    sort,
    productList,
    totalItems,
    currentPage,
    totalPages,
    isLoading: isFetching,
    onPageChange,
    onFiltersChange,
    onSortChange,
    allLoadedItems,
    shownItemsCount,
  };
};
