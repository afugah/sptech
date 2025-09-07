/**
 * Strategic commerce data hooks with optimized cache timing
 */

import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { INVALIDATION_PATTERNS, QUERY_CONFIGS, QUERY_KEYS } from '../queryConfig';

/**
 * Hook for product data with background refresh
 * Uses medium cache duration with automatic background updates
 */
export function useProductData<T>(
  productId: string,
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.products([QUERY_KEYS.PRODUCTS, productId, marketCode], fetcher),
    enabled: enabled && !!productId && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for product search results
 * Uses search-specific cache timing
 */
export function useProductSearch<T>(
  searchQuery: string,
  filters: Record<string, unknown>,
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.search([QUERY_KEYS.SEARCH_RESULTS, searchQuery, filters, marketCode], fetcher),
    enabled: enabled && !!searchQuery && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for cart data with real-time updates
 * Uses short cache duration for frequently changing data
 */
export function useCartData<T>(
  sessionId: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.cartSession([QUERY_KEYS.CART, sessionId], fetcher),
    enabled: enabled && !!sessionId,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for session data
 * Uses cart/session cache timing
 */
export function useSessionData<T>(
  sessionId: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.cartSession([QUERY_KEYS.SESSION, sessionId], fetcher),
    enabled: enabled && !!sessionId,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for product categories
 * Uses product data cache timing with background refresh
 */
export function useCategories<T>(
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.products([QUERY_KEYS.CATEGORIES, marketCode], fetcher),
    enabled: enabled && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for product collections
 * Uses product data cache timing
 */
export function useCollections<T>(
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.products([QUERY_KEYS.COLLECTIONS, marketCode], fetcher),
    enabled: enabled && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for real-time inventory data
 * Uses real-time cache timing with frequent updates
 */
export function useInventoryData<T>(
  productIds: string[],
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.realTime([QUERY_KEYS.INVENTORY, productIds.sort(), marketCode], fetcher),
    enabled: enabled && productIds.length > 0 && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for pricing data
 * Uses real-time cache timing for dynamic pricing
 */
export function usePricingData<T>(
  productIds: string[],
  marketCode: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.realTime([QUERY_KEYS.PRICING, productIds.sort(), marketCode], fetcher),
    enabled: enabled && productIds.length > 0 && !!marketCode,
  }) as UseQueryResult<T, Error>;
}

/**
 * Mutation for adding items to cart with optimistic updates
 */
export function useAddToCartMutation<_TData, TVariables>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: TVariables) => {
      // This will be implemented by the consumer
      throw new Error('mutationFn must be provided');
    },
    onSuccess: () => {
      // Invalidate cart-related queries
      INVALIDATION_PATTERNS.cart.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error) => {
      console.error('[Commerce] Add to cart failed:', error);
    },
  });
}

/**
 * Mutation for updating cart items
 */
export function useUpdateCartMutation<_TData, TVariables>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: TVariables) => {
      // This will be implemented by the consumer
      throw new Error('mutationFn must be provided');
    },
    onSuccess: () => {
      // Invalidate cart-related queries
      INVALIDATION_PATTERNS.cart.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error) => {
      console.error('[Commerce] Update cart failed:', error);
    },
  });
}

/**
 * Mutation for removing items from cart
 */
export function useRemoveFromCartMutation<_TData, TVariables>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_variables: TVariables) => {
      // This will be implemented by the consumer
      throw new Error('mutationFn must be provided');
    },
    onSuccess: () => {
      // Invalidate cart-related queries
      INVALIDATION_PATTERNS.cart.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: (error) => {
      console.error('[Commerce] Remove from cart failed:', error);
    },
  });
}
