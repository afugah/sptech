/**
 * Strategic TanStack Query Configuration
 *
 * Based on ARKITECT.md patterns with optimized cache timing for different data types.
 * Follows the multi-tier caching strategy similar to Storyblok cache configuration.
 */

import { type DefaultOptions } from '@tanstack/react-query';

/**
 * Cache timing constants based on data characteristics
 */
export const CACHE_TIMINGS = {
  // Static/Reference Data - Long cache duration
  STATIC_CONTENT: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  },

  // Navigation/Menu Data - Medium cache duration
  NAVIGATION: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },

  // Product Data - Short cache duration (frequently changing)
  PRODUCT_DATA: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },

  // Real-time Data - Very short cache duration
  REAL_TIME: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  },

  // User-specific Data - Minimal cache duration
  USER_SPECIFIC: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },

  // Search Results - Medium cache with quick refresh
  SEARCH_RESULTS: {
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  },

  // Cart/Session Data - Fresh data priority
  CART_SESSION: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  },

  // Analytics/Tracking - Background priority
  ANALYTICS: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 4, // 4 hours
  },
} as const;

/**
 * Query key prefixes for different data types
 */
export const QUERY_KEYS = {
  // Static content
  CMS_CONTENT: 'cms-content',
  NAVIGATION: 'navigation',
  GLOBAL_SETTINGS: 'global-settings',

  // Product data
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
  INVENTORY: 'inventory',
  PRICING: 'pricing',

  // User data
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: 'user-preferences',

  // E-commerce
  CART: 'cart',
  SESSION: 'session',
  CHECKOUT: 'checkout',

  // Search
  SEARCH_RESULTS: 'search-results',
  SEARCH_SUGGESTIONS: 'search-suggestions',

  // Analytics
  ANALYTICS: 'analytics',
  TRACKING: 'tracking',
} as const;

/**
 * Enhanced default options with strategic cache timing
 */
export const createStrategicQueryDefaults = (): DefaultOptions => ({
  queries: {
    staleTime: CACHE_TIMINGS.PRODUCT_DATA.staleTime, // Default to product data timing
    gcTime: CACHE_TIMINGS.PRODUCT_DATA.gcTime,
    retry: (failureCount, error) => {
      // Smart retry logic based on error type
      if (failureCount >= 3) return false;

      // Don't retry client errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) return false;
      }

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    // Enable background refetch for fresh data
    refetchInterval: false, // Disabled by default, enable per query as needed
    // Optimistic updates for better UX
    notifyOnChangeProps: 'all',
  },
  mutations: {
    retry: 1,
    // Invalidate related queries on mutation success
    onSuccess: () => {
      // This will be overridden per mutation
    },
    onError: (error) => {
      console.warn('[TanStack Query] Mutation failed:', error);
    },
  },
});

/**
 * Testing environment configuration
 */
export const createTestingQueryDefaults = (): DefaultOptions => ({
  queries: {
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  mutations: {
    retry: false,
  },
});

/**
 * Helper function to create query options with appropriate cache timing
 */
export const createQueryOptions = (
  dataType: keyof typeof CACHE_TIMINGS,
  options: {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
    enabled?: boolean;
    refetchInterval?: number | false;
    [key: string]: unknown;
  },
) => {
  const timing = CACHE_TIMINGS[dataType];

  return {
    ...options,
    staleTime: timing.staleTime,
    gcTime: timing.gcTime,
  };
};

/**
 * Predefined query configurations for common data types
 */
export const QUERY_CONFIGS = {
  // Static content queries
  staticContent: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('STATIC_CONTENT', { queryKey, queryFn }),

  // Navigation queries
  navigation: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('NAVIGATION', { queryKey, queryFn }),

  // Product queries with background refresh
  products: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('PRODUCT_DATA', {
      queryKey,
      queryFn,
      refetchInterval: 1000 * 60 * 10, // Refresh every 10 minutes in background
    }),

  // Real-time data queries
  realTime: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('REAL_TIME', {
      queryKey,
      queryFn,
      refetchInterval: 1000 * 30, // Refresh every 30 seconds
    }),

  // User-specific queries
  userSpecific: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('USER_SPECIFIC', { queryKey, queryFn }),

  // Search queries
  search: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('SEARCH_RESULTS', { queryKey, queryFn }),

  // Cart/session queries
  cartSession: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('CART_SESSION', {
      queryKey,
      queryFn,
      refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes for session data
    }),

  // Analytics queries (low priority)
  analytics: (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    createQueryOptions('ANALYTICS', { queryKey, queryFn }),
} as const;

/**
 * Query invalidation helpers
 */
export const INVALIDATION_PATTERNS = {
  // Invalidate all product-related queries
  products: [QUERY_KEYS.PRODUCTS, QUERY_KEYS.CATEGORIES, QUERY_KEYS.COLLECTIONS],

  // Invalidate cart-related queries
  cart: [QUERY_KEYS.CART, QUERY_KEYS.SESSION, QUERY_KEYS.CHECKOUT],

  // Invalidate user-related queries
  user: [QUERY_KEYS.USER_PROFILE, QUERY_KEYS.USER_PREFERENCES, QUERY_KEYS.CART],

  // Invalidate search-related queries
  search: [QUERY_KEYS.SEARCH_RESULTS, QUERY_KEYS.SEARCH_SUGGESTIONS],

  // Invalidate navigation queries
  navigation: [QUERY_KEYS.NAVIGATION, QUERY_KEYS.CMS_CONTENT],
} as const;

/**
 * Performance monitoring for queries
 */
export const withQueryPerformanceLogging = <T>(queryFn: () => Promise<T>, queryKey: unknown[]): (() => Promise<T>) => {
  return async () => {
    const now = () => {
      if (typeof window !== 'undefined' && window.performance?.now) {
        return window.performance.now();
      }
      return Date.now();
    };

    const start = now();

    try {
      const result = await queryFn();
      const duration = now() - start;

      if (duration > 1000) {
        console.warn(`[TanStack Query] Slow query detected:`, {
          queryKey,
          duration: `${duration.toFixed(2)}ms`,
        });
      }

      return result;
    } catch (error) {
      const duration = now() - start;
      console.error(`[TanStack Query] Query failed:`, {
        queryKey,
        duration: `${duration.toFixed(2)}ms`,
        error,
      });
      throw error;
    }
  };
};
