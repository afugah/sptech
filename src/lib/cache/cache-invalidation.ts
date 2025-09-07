/**
 * Cache Invalidation Utilities
 *
 * Provides programmatic cache invalidation functions for use throughout the application
 * Implements ARKITECT.md cache invalidation patterns
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { STORYBLOK_CACHE_TAGS } from '../storyblok/cachedStoryblokFetcher';
import { cacheService } from './cache-service';

/**
 * Storyblok content type mapping for cache invalidation
 */
export const STORYBLOK_CONTENT_MAPPING = {
  // Navigation and menu components
  navigation: [STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
  menu: [STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
  header: [STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],
  footer: [STORYBLOK_CACHE_TAGS.CMS_NAVIGATION],

  // Product-related components
  product: [STORYBLOK_CACHE_TAGS.CMS_PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  category: [STORYBLOK_CACHE_TAGS.CMS_PRODUCTS, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  'product-listing': [STORYBLOK_CACHE_TAGS.CMS_PRODUCTS],
  'category-page': [STORYBLOK_CACHE_TAGS.CMS_PRODUCTS],

  // Reference content
  'size-guide': [STORYBLOK_CACHE_TAGS.CMS_REFERENCE, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  'diamond-information': [STORYBLOK_CACHE_TAGS.CMS_REFERENCE, STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  reference: [STORYBLOK_CACHE_TAGS.CMS_REFERENCE],

  // Global settings
  global: [STORYBLOK_CACHE_TAGS.CMS_GLOBAL],
  settings: [STORYBLOK_CACHE_TAGS.CMS_GLOBAL],
  config: [STORYBLOK_CACHE_TAGS.CMS_GLOBAL],

  // General content
  page: [STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  'landing-page': [STORYBLOK_CACHE_TAGS.CMS_CONTENT],
  content: [STORYBLOK_CACHE_TAGS.CMS_CONTENT],
} as const;

/**
 * Invalidate cache tags based on Storyblok component type
 */
export function invalidateStoryblokComponent(
  component: string,
  options: {
    reason?: string;
    includeMemoryCache?: boolean;
  } = {},
): void {
  const { reason = 'Component update', includeMemoryCache = true } = options;

  const tags = STORYBLOK_CONTENT_MAPPING[component as keyof typeof STORYBLOK_CONTENT_MAPPING] || [
    STORYBLOK_CACHE_TAGS.CMS_CONTENT,
  ];

  for (const tag of tags) {
    revalidateTag(tag);
    console.warn(`Cache tag invalidated: ${tag} (${reason})`);
  }

  if (includeMemoryCache) {
    const memoryInvalidated = cacheService.invalidateByTags([...tags]);
    console.warn(`Memory cache invalidated: ${memoryInvalidated} entries (${reason})`);
  }
}

/**
 * Invalidate cache tags based on Storyblok story slug
 */
export function invalidateStoryblokSlug(
  slug: string,
  options: {
    reason?: string;
    includeMemoryCache?: boolean;
  } = {},
): void {
  const { reason = 'Slug update', includeMemoryCache = true } = options;

  const tags: string[] = [];

  // Navigation and menu content
  if (slug.includes('navigation') || slug.includes('menu') || slug.includes('header') || slug.includes('footer')) {
    tags.push(STORYBLOK_CACHE_TAGS.CMS_NAVIGATION);
  }

  // Product-related content
  if (slug.includes('product') || slug.includes('category')) {
    tags.push(STORYBLOK_CACHE_TAGS.CMS_PRODUCTS);
  }

  // Reference content
  if (slug.includes('size-guide') || slug.includes('diamond-information')) {
    tags.push(STORYBLOK_CACHE_TAGS.CMS_REFERENCE);
  }

  // Global settings
  if (slug.includes('global') || slug.includes('settings') || slug.includes('config')) {
    tags.push(STORYBLOK_CACHE_TAGS.CMS_GLOBAL);
  }

  // Default to general content
  if (tags.length === 0) {
    tags.push(STORYBLOK_CACHE_TAGS.CMS_CONTENT);
  }

  for (const tag of tags) {
    revalidateTag(tag);
    console.warn(`Cache tag invalidated: ${tag} for slug ${slug} (${reason})`);
  }

  if (includeMemoryCache) {
    const memoryInvalidated = cacheService.invalidateByTags([...tags]);
    console.warn(`Memory cache invalidated: ${memoryInvalidated} entries for slug ${slug} (${reason})`);
  }
}

/**
 * Invalidate specific paths (pages)
 */
export function invalidatePaths(
  paths: string[],
  options: {
    reason?: string;
  } = {},
): void {
  const { reason = 'Path update' } = options;

  for (const path of paths) {
    revalidatePath(path);
    console.warn(`Path invalidated: ${path} (${reason})`);
  }
}

/**
 * Invalidate all Storyblok cache tags
 */
export function invalidateAllStoryblokCache(
  options: {
    reason?: string;
    includeMemoryCache?: boolean;
  } = {},
): void {
  const { reason = 'Full cache invalidation', includeMemoryCache = true } = options;

  const allTags = Object.values(STORYBLOK_CACHE_TAGS);

  for (const tag of allTags) {
    revalidateTag(tag);
    console.warn(`Cache tag invalidated: ${tag} (${reason})`);
  }

  if (includeMemoryCache) {
    cacheService.clear();
    console.warn(`All memory cache cleared (${reason})`);
  }
}

/**
 * Scheduled cache warming for critical Storyblok content
 */
export async function warmCriticalStoryblokCache(locale: string): Promise<void> {
  try {
    // Import the warming function to avoid circular dependencies
    const { warmStoryblokCache } = await import('../storyblok/cachedStoryblokFetcher');
    await warmStoryblokCache(locale);
    console.warn(`Cache warmed for locale: ${locale}`);
  } catch (error) {
    console.error(`Failed to warm cache for locale ${locale}:`, error);
  }
}

/**
 * Cache invalidation middleware for API routes
 */
export function withCacheInvalidation<T>(
  handler: (data: T) => Promise<void> | void,
  cacheConfig: {
    tags?: string[];
    paths?: string[];
    component?: string;
    slug?: string;
    reason?: string;
  },
) {
  return async (data: T) => {
    // Execute the main handler
    await handler(data);

    const { tags, paths, component, slug, reason = 'API update' } = cacheConfig;

    // Invalidate specified cache tags
    if (tags) {
      for (const tag of tags) {
        revalidateTag(tag);
        console.warn(`Cache tag invalidated: ${tag} (${reason})`);
      }
    }

    // Invalidate specified paths
    if (paths) {
      invalidatePaths(paths, { reason });
    }

    // Invalidate by component type
    if (component) {
      invalidateStoryblokComponent(component, { reason });
    }

    // Invalidate by slug pattern
    if (slug) {
      invalidateStoryblokSlug(slug, { reason });
    }
  };
}

/**
 * Get cache invalidation statistics
 */
export function getCacheInvalidationStats() {
  const memoryStats = cacheService.getStats();

  return {
    memory_cache: memoryStats,
    available_tags: Object.values(STORYBLOK_CACHE_TAGS),
    content_mapping: Object.keys(STORYBLOK_CONTENT_MAPPING),
    timestamp: new Date().toISOString(),
  };
}
