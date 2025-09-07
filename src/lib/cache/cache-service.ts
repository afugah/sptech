/**
 * Advanced Cache Service for Vercel Edge Optimization
 *
 * Provides unified caching interface with support for:
 * - In-memory caching for Edge Runtime
 * - ISR (Incremental Static Regeneration)
 * - Stale-while-revalidate patterns
 * - Cache invalidation strategies
 */

import { type CacheConfig, type CacheOptions, generateCacheKey, getCacheHeaders } from './advanced-caching';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
  staleAt?: number;
}

/**
 * In-memory cache for Edge Runtime
 * Optimized for fast access in edge functions
 */
class EdgeMemoryCache {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxSize = 1000; // Limit memory usage

  set<T>(key: string, data: T, config: CacheConfig): void {
    const now = Date.now();
    const expiresAt = now + config.ttl * 1000;
    const staleAt = config.staleWhileRevalidate ? now + config.staleWhileRevalidate * 1000 : undefined;

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      staleAt,
    });

    // Simple LRU eviction if cache grows too large
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();

    // Check if completely expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Check if stale but valid
    const isStale = entry.staleAt ? now > entry.staleAt : false;

    return {
      data: entry.data as T,
      isStale,
    };
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Unified Cache Service
 */
export class CacheService {
  private readonly memoryCache = new EdgeMemoryCache();

  /**
   * Get data from cache with fallback
   */
  async get<T>(options: CacheOptions<T>): Promise<T> {
    const { key, config, fallback } = options;

    // Try memory cache first
    const cached = this.memoryCache.get<T>(key);

    if (cached) {
      // If data is fresh, return it
      if (!cached.isStale) {
        return cached.data;
      }

      // If stale but revalidate is disabled, still return cached data
      if (!config.revalidateOnStale) {
        return cached.data;
      }

      // Stale-while-revalidate: return stale data and revalidate in background
      if (fallback) {
        this.revalidateInBackground(key, config, fallback);
      }

      return cached.data;
    }

    // Cache miss - fetch fresh data
    if (fallback) {
      try {
        const freshData = await fallback();
        this.set(key, freshData, config);
        return freshData;
      } catch (error) {
        console.error(`Cache fallback failed for key ${key}:`, error);
        throw error;
      }
    }

    throw new Error(`No cached data found for key: ${key}`);
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, config: CacheConfig): void {
    this.memoryCache.set(key, data, config);
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    const stats = this.memoryCache.getStats();

    // Simple tag-based invalidation (in production, use Redis for this)
    stats.keys.forEach((key) => {
      if (tags.some((tag) => key.includes(tag))) {
        this.memoryCache.delete(key);
        invalidated++;
      }
    });

    return invalidated;
  }

  /**
   * Background revalidation for stale-while-revalidate
   */
  private async revalidateInBackground<T>(key: string, config: CacheConfig, fallback: () => Promise<T>): Promise<void> {
    try {
      const freshData = await fallback();
      this.set(key, freshData, config);
    } catch (error) {
      console.error(`Background revalidation failed for key ${key}:`, error);
    }
  }

  /**
   * Warm cache with predefined data
   */
  async warmCache<T>(keys: Array<{ key: string; config: CacheConfig; fetcher: () => Promise<T> }>): Promise<void> {
    const promises = keys.map(async ({ key, config, fetcher }) => {
      try {
        const data = await fetcher();
        this.set(key, data, config);
      } catch (error) {
        console.error(`Cache warming failed for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.memoryCache.getStats();
  }
}

// Singleton instance for Edge Runtime
export const cacheService = new CacheService();

/**
 * Helper functions for common caching patterns
 */

/**
 * Cache wrapper for API responses
 */
export async function withApiCache<T>(
  cacheKey: string,
  config: CacheConfig,
  fetcher: () => Promise<T>,
): Promise<{ data: T; headers: Record<string, string> }> {
  const data = await cacheService.get({
    key: cacheKey,
    config,
    fallback: fetcher,
  });

  const headers = getCacheHeaders(config);

  return { data, headers };
}

/**
 * Cache wrapper for product data
 */
export async function withProductCache<T>(productId: string, fetcher: () => Promise<T>): Promise<T> {
  const cacheKey = generateCacheKey('product', productId);

  return cacheService.get({
    key: cacheKey,
    config: {
      ttl: 3600, // 1 hour
      staleWhileRevalidate: 14400, // 4 hours
      revalidateOnStale: true,
      tags: ['products'],
    },
    fallback: fetcher,
  });
}

/**
 * Cache wrapper for search results
 */
export async function withSearchCache<T>(
  query: string,
  filters: Record<string, unknown>,
  fetcher: () => Promise<T>,
): Promise<T> {
  const filterKey = JSON.stringify(filters);
  const cacheKey = generateCacheKey('search', `${query}-${filterKey}`);

  return cacheService.get({
    key: cacheKey,
    config: {
      ttl: 1800, // 30 minutes
      staleWhileRevalidate: 7200, // 2 hours
      revalidateOnStale: true,
      tags: ['search', 'products'],
    },
    fallback: fetcher,
  });
}
