/**
 * Custom ISR Cache Handler for Vercel Optimization
 *
 * Implements enhanced caching strategies for optimal performance
 * on Vercel's Edge Network with ISR support.
 */

const LRUCache = require('lru-cache');

class VercelCacheHandler {
  constructor(options) {
    this.options = options;

    // Initialize LRU cache for in-memory storage
    this.cache = new LRUCache({
      max: 1000, // Maximum number of items
      maxSize: 50 * 1024 * 1024, // 50MB max size
      sizeCalculation: (value) => {
        return JSON.stringify(value).length;
      },
      ttl: 1000 * 60 * 60, // 1 hour default TTL
      allowStale: true, // Allow stale data for SWR
      updateAgeOnGet: false,
      updateAgeOnHas: false,
    });

    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      staleHits: 0,
    };
  }

  async get(key) {
    try {
      const cached = this.cache.get(key);

      if (cached) {
        if (this.cache.isStale(key)) {
          this.metrics.staleHits++;
        } else {
          this.metrics.hits++;
        }

        return {
          value: cached,
          lastModified: Date.now(),
        };
      }

      this.metrics.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.metrics.misses++;
      return null;
    }
  }

  async set(key, data, ctx = {}) {
    try {
      // Extract cache configuration from context
      const { revalidate, tags = [] } = ctx;

      // Calculate TTL based on revalidate value
      let ttl = this.cache.ttl;
      if (revalidate) {
        ttl = revalidate * 1000; // Convert seconds to milliseconds
      }

      // Enhanced cache entry with metadata
      const cacheEntry = {
        data: data.value || data,
        timestamp: Date.now(),
        revalidate,
        tags,
        kind: data.kind || 'PAGE',
      };

      this.cache.set(key, cacheEntry, { ttl });
      this.metrics.sets++;

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async revalidateTag(tag) {
    try {
      let deletedCount = 0;

      // Iterate through cache and delete entries with matching tags
      for (const [key, value] of this.cache.entries()) {
        if (value && value.tags && value.tags.includes(tag)) {
          this.cache.delete(key);
          deletedCount++;
        }
      }

      this.metrics.deletes += deletedCount;

      console.warn(`Revalidated tag "${tag}", deleted ${deletedCount} entries`);
      return true;
    } catch (error) {
      console.error('Cache revalidate tag error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.metrics.deletes++;
      }
      return deleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Get cache statistics for monitoring
  getStats() {
    return {
      ...this.metrics,
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
      staleHitRate: this.metrics.staleHits / this.metrics.hits || 0,
    };
  }

  // Warm cache with critical pages
  async warmCache(pages = []) {
    console.warn(`Warming cache for ${pages.length} pages`);

    for (const page of pages) {
      try {
        // Pre-populate cache with empty entry to mark as "warming"
        await this.set(
          page.key,
          { warming: true },
          {
            revalidate: page.revalidate || 3600,
            tags: page.tags || [],
          },
        );
      } catch (error) {
        console.error(`Failed to warm cache for ${page.key}:`, error);
      }
    }
  }

  // Clean up expired entries
  async cleanup() {
    const sizeBefore = this.cache.size;
    this.cache.purgeStale();
    const sizeAfter = this.cache.size;

    console.warn(`Cache cleanup: removed ${sizeBefore - sizeAfter} stale entries`);
    return sizeBefore - sizeAfter;
  }
}

module.exports = VercelCacheHandler;
