/**
 * Advanced Caching Strategy for Vercel Optimization
 *
 * Implements ISR, Redis caching, and stale-while-revalidate patterns
 * for optimal performance on Vercel Edge Network.
 */

export interface CacheConfig {
  ttl: number;
  staleWhileRevalidate?: number;
  revalidateOnStale?: boolean;
  tags?: string[];
}

export interface CacheOptions<T = unknown> {
  key: string;
  config: CacheConfig;
  fallback?: () => Promise<T>;
}

// Cache duration constants optimized for Vercel
export const CACHE_DURATIONS = {
  STATIC_CONTENT: 31536000, // 1 year for static assets
  PRODUCT_DATA: 3600, // 1 hour for product information
  CATEGORY_DATA: 7200, // 2 hours for category data
  USER_SESSION: 900, // 15 minutes for user sessions
  SEARCH_RESULTS: 1800, // 30 minutes for search results
  CMS_CONTENT: 600, // 10 minutes for CMS content
  API_RESPONSES: 300, // 5 minutes for API responses
  REAL_TIME: 60, // 1 minute for real-time data
} as const;

// Stale-while-revalidate patterns
export const SWR_PATTERNS = {
  PRODUCT_CATALOG: {
    fresh: 3600, // 1 hour fresh
    stale: 86400, // 1 day stale
  },
  SEARCH_INDEX: {
    fresh: 1800, // 30 minutes fresh
    stale: 7200, // 2 hours stale
  },
  USER_PREFERENCES: {
    fresh: 900, // 15 minutes fresh
    stale: 3600, // 1 hour stale
  },
  CMS_BLOCKS: {
    fresh: 600, // 10 minutes fresh
    stale: 1800, // 30 minutes stale
  },
} as const;

/**
 * Cache key generator with consistent formatting
 */
export function generateCacheKey(namespace: string, identifier: string, version?: string): string {
  const parts = [namespace, identifier];
  if (version) parts.push(version);
  return parts.join(':');
}

/**
 * Cache tags for efficient invalidation
 */
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CMS: 'cms',
  USER: 'user',
  SEARCH: 'search',
  INVENTORY: 'inventory',
  PRICING: 'pricing',
  PROMOTIONS: 'promotions',
} as const;

/**
 * ISR revalidation configuration
 */
export const ISR_CONFIG = {
  // Homepage and landing pages
  STATIC_PAGES: {
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.CMS],
  },

  // Product listing pages
  PRODUCT_LISTINGS: {
    revalidate: 1800, // 30 minutes
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.INVENTORY],
  },

  // Individual product pages
  PRODUCT_DETAILS: {
    revalidate: 900, // 15 minutes
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRICING, CACHE_TAGS.INVENTORY],
  },

  // Category pages
  CATEGORY_PAGES: {
    revalidate: 1800, // 30 minutes
    tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.PRODUCTS],
  },

  // Search results
  SEARCH_RESULTS: {
    revalidate: 600, // 10 minutes
    tags: [CACHE_TAGS.SEARCH, CACHE_TAGS.PRODUCTS],
  },
} as const;

/**
 * Cache headers for different content types
 */
export function getCacheHeaders(config: CacheConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  if (config.staleWhileRevalidate) {
    headers['Cache-Control'] = `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate}`;
  } else {
    headers['Cache-Control'] = `public, max-age=${config.ttl}`;
  }

  if (config.tags && config.tags.length > 0) {
    headers['Cache-Tags'] = config.tags.join(',');
  }

  return headers;
}

/**
 * Vercel-specific cache optimization
 */
export const VERCEL_CACHE_CONFIG = {
  // Edge caching for static assets
  STATIC_ASSETS: {
    ttl: CACHE_DURATIONS.STATIC_CONTENT,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
    },
  },

  // API response caching
  API_RESPONSES: {
    ttl: CACHE_DURATIONS.API_RESPONSES,
    staleWhileRevalidate: CACHE_DURATIONS.API_RESPONSES * 2,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 'public, max-age=300',
    },
  },

  // Product data caching
  PRODUCT_DATA: {
    ttl: CACHE_DURATIONS.PRODUCT_DATA,
    staleWhileRevalidate: CACHE_DURATIONS.PRODUCT_DATA * 4,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=14400',
      'CDN-Cache-Control': 'public, max-age=3600',
    },
  },
} as const;

/**
 * Cache warming priorities for Vercel precompilation
 */
export const CACHE_WARMING_PRIORITY = {
  CRITICAL: ['/', '/products', '/categories'],
  HIGH: ['/search', '/offers', '/about'],
  MEDIUM: ['/support', '/contact', '/store-locator'],
  LOW: ['/terms', '/privacy', '/cookies'],
} as const;

/**
 * Geographic cache distribution for Vercel Edge
 */
export const GEO_CACHE_REGIONS = {
  EU: ['arn1', 'fra1', 'lhr1'],
  US: ['iad1', 'sfo1', 'pdx1'],
  ASIA: ['sin1', 'hnd1', 'icn1'],
  GLOBAL: ['all'],
} as const;
