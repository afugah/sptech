import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useQueryStates } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getFiltersParser, getPageParser, getSortParser } from '@/src/helpers/searchParams';
import { useDeepMemo } from '@/src/hooks/useDeepMemo';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { QUERY_CONFIGS, QUERY_KEYS, withQueryPerformanceLogging } from '@/src/lib/tanstack-query/hooks';
import { getSearchItems } from '../actions';

interface SearchProductProps {
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
  initialPage: number;
  q: string;
  // Performance options (now using strategic defaults)
  debounceMs?: number;
  prefetchNextPage?: boolean;
  enablePerformanceLogging?: boolean;
}

interface SearchProductReturn {
  sort: ICollectionSearch.Sort;
  productList: ICollectionItem[];
  totalItems: number;
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onFiltersChange: (filter?: ICollectionSearch.Filter) => void;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  // Performance utilities
  clearCache: () => void;
  refetch: () => void;
  // Infinite loading support
  loadNextPage: () => Promise<void>;
  allProducts: ICollectionItem[]; // For infinite scroll
}

// Cache for search results to improve performance
const searchCache = new Map<string, unknown>();
const CACHE_SIZE_LIMIT = 100;

// Utility to create cache key
const createCacheKey = (marketCode: string, query: string, filters: unknown, sort: unknown, page: number) => {
  return JSON.stringify({ marketCode, query, filters, sort, page });
};

// Utility to manage cache size
const manageCacheSize = () => {
  if (searchCache.size > CACHE_SIZE_LIMIT) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) {
      searchCache.delete(firstKey);
    }
  }
};

export const useOptimizedSearchProduct = ({
  q,
  defaultFilters,
  defaultSort,
  initialPage,
  debounceMs = 300,
  prefetchNextPage = true,
  enablePerformanceLogging = false,
}: SearchProductProps): SearchProductReturn => {
  const marketCode = useMarketCode();
  const _queryClient = useRef<unknown>(null);
  const accumulatedProducts = useRef<ICollectionItem[]>([]);

  const [queryState, setQueryStates] = useQueryStates(
    {
      ...getFiltersParser(defaultFilters),
      ...getSortParser(defaultSort),
      ...getPageParser(initialPage),
    },
    {
      clearOnDefault: true,
      throttleMs: debounceMs,
    },
  );

  const { brand, category, color, field, order, page: currentPage, price, size } = queryState;

  // Memoized filters and sort with deep comparison
  const filters = useDeepMemo(
    () => ({
      brand: brand || defaultFilters.brand,
      color: color || defaultFilters.color,
      category: category || defaultFilters.category,
      size: size || defaultFilters.size,
      price: price || defaultFilters.price,
    }),
    [brand, color, category, size, price, defaultFilters],
  );

  const sort = useDeepMemo(
    () => ({
      field: field || defaultSort.field,
      order: order || defaultSort.order,
    }),
    [field, order, defaultSort],
  );

  // Create stable query key using strategic patterns
  const queryKey = useMemo(
    () => [QUERY_KEYS.SEARCH_RESULTS, marketCode, q, filters, sort, currentPage - 1],
    [marketCode, q, filters, sort, currentPage],
  );

  // Optimized query function with caching and performance logging
  const baseQueryFn = useCallback(async () => {
    const cacheKey = createCacheKey(marketCode, q, filters, sort, currentPage - 1);

    // Check cache first
    if (searchCache.has(cacheKey)) {
      return searchCache.get(cacheKey);
    }

    try {
      const result = await getSearchItems(marketCode, q, filters, [sort], currentPage - 1);

      // Cache the result
      searchCache.set(cacheKey, result);
      manageCacheSize();

      return result;
    } catch (error) {
      console.error('Search query failed:', error);
      throw error;
    }
  }, [marketCode, q, filters, sort, currentPage]);

  const queryFn = useMemo(
    () => (enablePerformanceLogging ? withQueryPerformanceLogging(baseQueryFn, queryKey) : baseQueryFn),
    [baseQueryFn, queryKey, enablePerformanceLogging],
  );

  // Main query using strategic search configuration
  const searchQueryConfig = QUERY_CONFIGS.search(queryKey, queryFn);
  const { data, isFetching, isLoading, refetch } = useQuery({
    ...searchQueryConfig,
    enabled: !!marketCode && !!q,
  });

  // Derived state with memoization
  const productList = useMemo<ICollectionItem[]>(() => {
    if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
      return data.items as ICollectionItem[];
    }
    return [];
  }, [data]);

  const totalItems = useMemo(() => {
    if (
      data &&
      typeof data === 'object' &&
      'pagination' in data &&
      data.pagination &&
      typeof data.pagination === 'object' &&
      'total' in data.pagination &&
      data.pagination.total &&
      typeof data.pagination.total === 'object' &&
      'items' in data.pagination.total
    ) {
      return data.pagination.total.items as number;
    }
    return 0;
  }, [data]);

  const totalPages = useMemo(() => {
    if (
      data &&
      typeof data === 'object' &&
      'pagination' in data &&
      data.pagination &&
      typeof data.pagination === 'object' &&
      'total' in data.pagination &&
      data.pagination.total &&
      typeof data.pagination.total === 'object' &&
      'pages' in data.pagination.total
    ) {
      return data.pagination.total.pages as number;
    }
    return 1;
  }, [data]);
  const hasNextPage = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);
  const hasPreviousPage = useMemo(() => currentPage > 1, [currentPage]);

  // Infinite scroll support
  useEffect(() => {
    if (currentPage === 1) {
      accumulatedProducts.current = productList;
    } else {
      accumulatedProducts.current = [...accumulatedProducts.current, ...productList];
    }
  }, [productList, currentPage]);

  const allProducts = useMemo(() => accumulatedProducts.current, []);

  // Debounced state setters for better performance
  const debouncedSetQueryStates = useMemo(
    () =>
      debounce((newState: Record<string, unknown>) => {
        setQueryStates(newState);
      }, debounceMs),
    [setQueryStates, debounceMs],
  );

  // Optimized page change
  const onPageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;

      setQueryStates({ page });

      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    [setQueryStates, currentPage],
  );

  // Optimized sort change with debouncing
  const onSortChange = useCallback(
    (newSort?: ICollectionSearch.Sort) => {
      const sortUpdate = {
        page: 1,
        field: newSort?.field ?? defaultSort.field,
        order: newSort?.order ?? defaultSort.order,
      };

      // Reset accumulated products when sort changes
      accumulatedProducts.current = [];

      debouncedSetQueryStates(sortUpdate);
    },
    [defaultSort, debouncedSetQueryStates],
  );

  // Optimized filters change with debouncing
  const onFiltersChange = useCallback(
    (newFilters?: ICollectionSearch.Filter) => {
      const filtersUpdate = {
        page: 1,
        brand: newFilters?.brand ?? defaultFilters.brand,
        color: newFilters?.color ?? defaultFilters.color,
        category: newFilters?.category ?? defaultFilters.category,
        size: newFilters?.size ?? defaultFilters.size,
        price: newFilters?.price ?? defaultFilters.price,
      };

      // Reset accumulated products when filters change
      accumulatedProducts.current = [];

      debouncedSetQueryStates(filtersUpdate);
    },
    [defaultFilters, debouncedSetQueryStates],
  );

  // Load next page for infinite scroll
  const loadNextPage = useCallback(async () => {
    if (hasNextPage && !isFetching) {
      await onPageChange(currentPage + 1);
    }
  }, [hasNextPage, isFetching, onPageChange, currentPage]);

  // Clear cache utility
  const clearCache = useCallback(() => {
    searchCache.clear();
    accumulatedProducts.current = [];
    refetch();
  }, [refetch]);

  // Prefetch next page for better UX
  useEffect(() => {
    if (prefetchNextPage && hasNextPage && !isFetching) {
      const _prefetchKey = [
        'searchResults',
        marketCode,
        q,
        filters,
        sort,
        currentPage, // Next page
      ];

      // Prefetch next page in background (disabled for build compatibility)
      // TODO: Re-enable with proper QueryClient typing
      /*
      setTimeout(() => {
        if (queryClient.current && typeof queryClient.current === 'object' && 'prefetchQuery' in queryClient.current) {
          (queryClient.current as any).prefetchQuery({
            queryKey: prefetchKey,
            queryFn: () => getSearchItems(marketCode, q, filters, [sort], currentPage),
            staleTime: searchQueryConfig.staleTime ? searchQueryConfig.staleTime / 2 : 1000 * 60,
          });
        }
      }, 1000);
      */
    }
  }, [prefetchNextPage, hasNextPage, isFetching, marketCode, q, filters, sort, currentPage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSetQueryStates.cancel();
    };
  }, [debouncedSetQueryStates]);

  return {
    sort,
    productList,
    totalItems,
    isLoading,
    isFetching,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    onFiltersChange,
    onSortChange,
    clearCache,
    refetch,
    loadNextPage,
    allProducts,
  };
};
