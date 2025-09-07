import { useQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFiltersParser, getPageParser, getSortParser } from '@/src/helpers/searchParams';
import { useDeepMemo } from '@/src/hooks/useDeepMemo';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { getSearchItems } from '../../actions';

interface SearchProductProps {
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
  initialPage: number;
  q: string;
}

interface SearchProductReturn {
  sort: ICollectionSearch.Sort;
  productList: ICollectionItem[];
  totalItems: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filter?: ICollectionSearch.Filter) => void;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  allLoadedItems: ICollectionItem[];
  shownItemsCount: number;
}

export const useSearchProduct = ({
  q,
  defaultFilters,
  defaultSort,
  initialPage,
}: SearchProductProps): SearchProductReturn => {
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

  const {
    brand,
    category,
    material,
    additionalinfo,
    categorycode,
    gender,
    color,
    field,
    order,
    page: currentPage,
    size,
  } = queryState;
  const filters = useDeepMemo(
    () => ({
      brand,
      color,
      category,
      size,
      additionalinfo,
      categorycode,
      gender,
      material,
    }),
    [brand, color, material, additionalinfo, categorycode, gender, category, size],
  );

  const sort = useDeepMemo(() => ({ field, order }), [field, order]);

  const [allLoadedItems, setAllLoadedItems] = useState<ICollectionItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // For deep-linking: fetch all pages from 1 to currentPage on initial load
  const pagesToFetch =
    isInitialLoad && currentPage > 1 ? Array.from({ length: currentPage }, (_, i) => i) : [currentPage - 1];

  const { data, isFetching } = useQuery({
    queryKey: ['searchResults', marketCode, q, filters, sort, currentPage - 1, isInitialLoad],
    queryFn: async () => {
      if (isInitialLoad && currentPage > 1) {
        // Fetch all pages from 1 to currentPage for deep-linking
        const allPagesData = await Promise.all(
          pagesToFetch.map((pageIndex) => getSearchItems(marketCode, q, filters, [sort], pageIndex)),
        );

        // Combine all items from all pages
        const combinedItems = allPagesData.flatMap((pageData) => pageData.items || []);

        // Return the structure with combined items but pagination info from the last page
        const lastPageData = allPagesData[allPagesData.length - 1];
        return {
          ...lastPageData,
          items: combinedItems,
        };
      } else {
        // Normal single page fetch
        return getSearchItems(marketCode, q, filters, [sort], currentPage - 1);
      }
    },
    staleTime: Infinity,
  });

  const resetAllItems = useCallback(() => {
    setAllLoadedItems([]);
  }, []);

  useEffect(() => {
    if (data?.items) {
      setAllLoadedItems((prev) => {
        if (currentPage === 1 || isInitialLoad) {
          // On page 1 or initial deep-link load, replace all items
          setIsInitialLoad(false); // Mark initial load as complete
          return data.items;
        }
        // For subsequent "View More" clicks, append new items
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = data.items.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [data?.items, currentPage, isInitialLoad]);

  useEffect(() => {
    resetAllItems();
    setIsInitialLoad(true); // Reset initial load flag when filters/sort change
  }, [filters, sort, resetAllItems]);

  const productList = useMemo<ICollectionItem[]>(() => {
    return allLoadedItems;
  }, [allLoadedItems]);

  const totalItems = data?.pagination?.total?.items ?? 0;
  const totalPages = data?.pagination?.total?.pages ?? 1;
  const shownItemsCount = allLoadedItems.length;

  const onPageChange = useCallback(
    (page: number) => {
      setQueryStates({ page });
    },
    [setQueryStates],
  );

  const onSortChange = (newSort?: ICollectionSearch.Sort) => {
    resetAllItems();
    setIsInitialLoad(true);
    setQueryStates({
      page: 1,
      field: newSort?.field ?? defaultSort.field,
      order: newSort?.order ?? defaultSort.order,
    });
  };

  const onFiltersChange = (newFilters?: ICollectionSearch.Filter) => {
    resetAllItems();
    setIsInitialLoad(true);
    setQueryStates({
      page: 1,
      brand: newFilters?.brand ?? defaultFilters.brand,
      color: newFilters?.color ?? defaultFilters.color,
      category: newFilters?.category ?? defaultFilters.category,
      size: newFilters?.size ?? defaultFilters.size,
      additionalinfo: newFilters?.additionalinfo ?? defaultFilters.additionalinfo,
      categorycode: newFilters?.categorycode ?? defaultFilters.categorycode,
      price: newFilters?.price ?? defaultFilters?.price,
      gender: newFilters?.gender ?? defaultFilters.gender,
      material: newFilters?.material ?? defaultFilters.material,
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
