/**
 * Cached Storyblok Fetcher with unstable_cache
 *
 * Implements ARKITECT.md caching patterns for optimal Vercel performance:
 * - Multi-tier caching with unstable_cache
 * - Tag-based cache invalidation
 * - Strategic cache timing based on content type
 */

import { type ISbStoriesParams } from '@storyblok/react';
import { unstable_cache } from 'next/cache';
import { di } from '@/src/lib/di';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';
import { type StoryblokStory, type StoryblokStoryData } from './fetchStoryBlokStory';

/**
 * Cache configuration for different types of Storyblok content
 * Based on ARKITECT.md patterns for optimal performance
 */
export const STORYBLOK_CACHE_CONFIG = {
  // Static content (pages, navigation) - 1 hour cache
  STATIC_CONTENT: {
    revalidate: 3600, // 1 hour
    tags: ['cms-content'],
  },

  // Navigation and global content - 30 minutes cache
  NAVIGATION: {
    revalidate: 1800, // 30 minutes
    tags: ['cms-navigation'],
  },

  // Product-related content - 5 minutes cache
  PRODUCT_CONTENT: {
    revalidate: 300, // 5 minutes
    tags: ['cms-content', 'cms-products'],
  },

  // Global settings and configuration - 2 hours cache
  GLOBAL_SETTINGS: {
    revalidate: 7200, // 2 hours
    tags: ['cms-global'],
  },

  // Size guides and diamond info - 1 hour cache (rarely changes)
  REFERENCE_CONTENT: {
    revalidate: 3600, // 1 hour
    tags: ['cms-content', 'cms-reference'],
  },
} as const;

/**
 * Cache tags for different content types
 */
export const STORYBLOK_CACHE_TAGS = {
  CMS_CONTENT: 'cms-content',
  CMS_NAVIGATION: 'cms-navigation',
  CMS_PRODUCTS: 'cms-products',
  CMS_GLOBAL: 'cms-global',
  CMS_REFERENCE: 'cms-reference',
} as const;

/**
 * Determine cache configuration based on slug pattern
 */
function getCacheConfigForSlug(slug: string) {
  // Navigation and menu content
  if (slug.includes('navigation') || slug.includes('menu') || slug.includes('header') || slug.includes('footer')) {
    return STORYBLOK_CACHE_CONFIG.NAVIGATION;
  }

  // Product-related content
  if (slug.includes('product') || slug.includes('category')) {
    return STORYBLOK_CACHE_CONFIG.PRODUCT_CONTENT;
  }

  // Reference content (size guides, diamond info)
  if (slug.includes('size-guide') || slug.includes('diamond-information')) {
    return STORYBLOK_CACHE_CONFIG.REFERENCE_CONTENT;
  }

  // Global settings
  if (slug.includes('global') || slug.includes('settings') || slug.includes('config')) {
    return STORYBLOK_CACHE_CONFIG.GLOBAL_SETTINGS;
  }

  // Default to static content
  return STORYBLOK_CACHE_CONFIG.STATIC_CONTENT;
}

/**
 * Generate cache key for Storyblok content
 */
function generateStoryblokCacheKey(slug: string, locale: string, version: 'draft' | 'published'): string {
  return `storyblok:${slug}:${locale}:${version}`;
}

/**
 * Raw Storyblok API fetcher (without caching)
 * This is the core function that will be cached
 */
async function fetchStoryblokStoryRaw<T extends Record<string, unknown>>(
  slug: string,
  locale: string,
  options: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
    otherParams?: Record<string, string>;
  } = {},
): Promise<StoryblokStoryData<T>> {
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);
    const storyblokApi = getStoryblokInstance();

    const version = options.version || (isPreviewEnvironment() ? 'draft' : 'published');

    // Build sbConfig - only include language if it's defined and not empty
    const sbConfig: ISbStoriesParams = {
      version,
      ...options.otherParams,
      ...(options.resolveRelations ? { resolve_relations: options.resolveRelations } : {}),
    };

    // Only add language if it's actually defined and not empty
    if (language && language !== '') {
      sbConfig.language = language;
    }

    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbConfig);

    return {
      story: data?.story as StoryblokStory<T>,
      sbConfig,
      isPreview: isPreviewEnvironment(),
    };
  } catch (error) {
    // Check if it's a 404 (story not found) or "Unknown" error (also indicates not found)
    const is404 =
      error instanceof Error &&
      (error.message.includes('Not Found') || error.message.includes('404') || error.message === 'Unknown');

    // Only log full error for non-404 errors
    if (!is404) {
      console.error(`Error fetching Storyblok story (${slug}):`, error);
    }

    return {
      story: undefined,
      sbConfig: undefined,
      isPreview: isPreviewEnvironment(),
    };
  }
}

/**
 * Cached Storyblok fetcher using unstable_cache
 * Implements ARKITECT.md multi-tier caching patterns
 */
export async function fetchStoryblokStoryCached<T extends Record<string, unknown>>(
  slug: string,
  locale: string,
  options: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
    otherParams?: Record<string, string>;
    forceRefresh?: boolean;
  } = {},
): Promise<StoryblokStoryData<T>> {
  const version = options.version || (isPreviewEnvironment() ? 'draft' : 'published');
  const isPreview = isPreviewEnvironment();

  // Skip caching in preview mode, development, or when force refresh is requested
  if (isPreview || options.forceRefresh || version === 'draft' || process.env.NODE_ENV === 'development') {
    return fetchStoryblokStoryRaw<T>(slug, locale, options);
  }

  // Get cache configuration based on slug pattern
  const cacheConfig = getCacheConfigForSlug(slug);
  const cacheKey = generateStoryblokCacheKey(slug, locale, version);

  // Create cached version of the fetcher
  const cachedFetcher = unstable_cache(async () => fetchStoryblokStoryRaw<T>(slug, locale, options), [cacheKey], {
    revalidate: cacheConfig.revalidate,
    tags: [...cacheConfig.tags], // Create mutable copy
  });

  return cachedFetcher();
}

/**
 * Specialized cached fetchers for different content types
 */

/**
 * Fetch navigation content with optimized caching
 */
export async function fetchNavigationContent<T extends Record<string, unknown>>(
  slug: string,
  locale: string,
  options: Parameters<typeof fetchStoryblokStoryCached>[2] = {},
): Promise<StoryblokStoryData<T>> {
  return fetchStoryblokStoryCached<T>(slug, locale, {
    ...options,
    // Navigation content uses specific cache configuration
  });
}

/**
 * Fetch product-related content with shorter cache time
 */
export async function fetchProductContent<T extends Record<string, unknown>>(
  slug: string,
  locale: string,
  options: Parameters<typeof fetchStoryblokStoryCached>[2] = {},
): Promise<StoryblokStoryData<T>> {
  return fetchStoryblokStoryCached<T>(slug, locale, {
    ...options,
    // Product content uses specific cache configuration
  });
}

/**
 * Fetch reference content (size guides, diamond info) with longer cache time
 */
export async function fetchReferenceContent<T extends Record<string, unknown>>(
  slug: string,
  locale: string,
  options: Parameters<typeof fetchStoryblokStoryCached>[2] = {},
): Promise<StoryblokStoryData<T>> {
  return fetchStoryblokStoryCached<T>(slug, locale, {
    ...options,
    // Reference content uses specific cache configuration
  });
}

/**
 * Cache warming utility for critical Storyblok content
 */
export async function warmStoryblokCache(locale: string): Promise<void> {
  const criticalSlugs = ['navigation/main-menu', 'navigation/footer', 'global/settings', 'content/home'];

  // Warm cache for critical content in parallel
  await Promise.allSettled(
    criticalSlugs.map((slug) =>
      fetchStoryblokStoryCached(slug, locale).catch((error) =>
        console.warn(`Failed to warm cache for ${slug}:`, error),
      ),
    ),
  );
}

/**
 * Utility to generate cache tags for bulk invalidation
 */
export function getStoryblokCacheTags(contentType: keyof typeof STORYBLOK_CACHE_CONFIG): string[] {
  return [...STORYBLOK_CACHE_CONFIG[contentType].tags];
}
