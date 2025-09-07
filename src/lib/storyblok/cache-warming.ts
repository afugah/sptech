/**
 * Storyblok Cache Warming Service
 *
 * Implements proactive cache warming strategies for optimal Vercel performance
 * Based on ARKITECT.md cache warming patterns
 */

import { fetchStoryblokStoryCached } from './cachedStoryblokFetcher';

/**
 * Critical content slugs that should be warmed on application start
 */
export const CRITICAL_STORYBLOK_SLUGS = {
  // Navigation content (highest priority)
  NAVIGATION: ['navigation/main-menu', 'navigation/footer', 'navigation/mobile-menu', 'navigation/header-links'],

  // Global settings and configuration
  GLOBAL: ['global/settings', 'global/site-config', 'global/seo-defaults', 'global/gtm-config'],

  // Homepage content
  HOMEPAGE: ['content/home', 'content/hero-section', 'content/featured-products', 'content/brand-story'],

  // Reference content (size guides, diamond info)
  REFERENCE: [
    'content/size-guide',
    'content/diamond-information',
    'content/care-instructions',
    'content/sustainability-info',
  ],
} as const;

/**
 * Cache warming priority levels
 */
export const CACHE_WARMING_PRIORITY = {
  CRITICAL: [...CRITICAL_STORYBLOK_SLUGS.NAVIGATION, ...CRITICAL_STORYBLOK_SLUGS.GLOBAL],
  HIGH: [...CRITICAL_STORYBLOK_SLUGS.HOMEPAGE],
  MEDIUM: [...CRITICAL_STORYBLOK_SLUGS.REFERENCE],
} as const;

/**
 * Warm critical Storyblok content for a specific locale
 */
export async function warmStoryblokCacheForLocale(locale: string): Promise<{
  success: string[];
  failed: string[];
  timing: Record<string, number>;
}> {
  const results = {
    success: [] as string[],
    failed: [] as string[],
    timing: {} as Record<string, number>,
  };

  // Warm critical content first (parallel execution)
  const criticalPromises = CACHE_WARMING_PRIORITY.CRITICAL.map(async (slug) => {
    const start = Date.now();
    try {
      await fetchStoryblokStoryCached(slug, locale);
      const duration = Date.now() - start;
      results.success.push(slug);
      results.timing[slug] = duration;
      console.warn(`Cache warmed: ${slug} (${duration}ms)`);
    } catch (error) {
      results.failed.push(slug);
      console.error(`Cache warming failed for ${slug}:`, error);
    }
  });

  await Promise.allSettled(criticalPromises);

  // Warm high priority content (parallel execution with slight delay)
  setTimeout(async () => {
    const highPromises = CACHE_WARMING_PRIORITY.HIGH.map(async (slug) => {
      const start = Date.now();
      try {
        await fetchStoryblokStoryCached(slug, locale);
        const duration = Date.now() - start;
        results.success.push(slug);
        results.timing[slug] = duration;
        console.warn(`Cache warmed (high): ${slug} (${duration}ms)`);
      } catch (error) {
        results.failed.push(slug);
        console.error(`Cache warming failed for ${slug}:`, error);
      }
    });

    await Promise.allSettled(highPromises);
  }, 1000); // 1 second delay

  // Warm medium priority content (with longer delay)
  setTimeout(async () => {
    const mediumPromises = CACHE_WARMING_PRIORITY.MEDIUM.map(async (slug) => {
      const start = Date.now();
      try {
        await fetchStoryblokStoryCached(slug, locale);
        const duration = Date.now() - start;
        results.success.push(slug);
        results.timing[slug] = duration;
        console.warn(`Cache warmed (medium): ${slug} (${duration}ms)`);
      } catch (error) {
        results.failed.push(slug);
        console.error(`Cache warming failed for ${slug}:`, error);
      }
    });

    await Promise.allSettled(mediumPromises);
  }, 5000); // 5 second delay

  return results;
}

/**
 * Warm cache for all configured locales
 */
export async function warmStoryblokCacheForAllLocales(locales: string[]): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  // Process locales sequentially to avoid overwhelming the API
  for (const locale of locales) {
    try {
      results[locale] = await warmStoryblokCacheForLocale(locale);
      console.warn(`Cache warming completed for locale: ${locale}`);
    } catch (error) {
      results[locale] = { error: String(error) };
      console.error(`Cache warming failed for locale ${locale}:`, error);
    }

    // Small delay between locales
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Schedule periodic cache warming (for use in cron jobs or background tasks)
 */
export async function scheduleStoryblokCacheWarming(): Promise<void> {
  // This could be called from a Vercel cron job or background function
  try {
    const locales = ['en-us', 'sv-se', 'no-no', 'da-dk', 'fi-fi']; // Configure based on your markets
    const start = Date.now();

    console.warn('Starting scheduled Storyblok cache warming...');
    const results = await warmStoryblokCacheForAllLocales(locales);

    const duration = Date.now() - start;
    const totalSuccess = Object.values(results).reduce((acc: number, result) => {
      return acc + ((result as { success?: unknown[]; failed?: unknown[] })?.success?.length || 0);
    }, 0);
    const totalFailed = Object.values(results).reduce((acc: number, result) => {
      return acc + ((result as { success?: unknown[]; failed?: unknown[] })?.failed?.length || 0);
    }, 0);

    console.warn(`Cache warming completed in ${duration}ms - Success: ${totalSuccess}, Failed: ${totalFailed}`);
  } catch (error) {
    console.error('Scheduled cache warming failed:', error);
  }
}

/**
 * Smart cache warming based on page analytics
 */
export async function smartCacheWarming(
  popularSlugs: string[],
  locale: string,
  options: {
    maxConcurrent?: number;
    priority?: 'immediate' | 'background';
  } = {},
): Promise<void> {
  const { maxConcurrent = 5, priority = 'background' } = options;

  // Chunk the slugs to avoid overwhelming the API
  const chunks = [];
  for (let i = 0; i < popularSlugs.length; i += maxConcurrent) {
    chunks.push(popularSlugs.slice(i, i + maxConcurrent));
  }

  const processChunk = async (slugs: string[]) => {
    const promises = slugs.map(async (slug) => {
      try {
        await fetchStoryblokStoryCached(slug, locale);
        console.warn(`Smart cache warmed: ${slug}`);
      } catch (error) {
        console.error(`Smart cache warming failed for ${slug}:`, error);
      }
    });

    await Promise.allSettled(promises);
  };

  if (priority === 'immediate') {
    // Process all chunks immediately
    for (const chunk of chunks) {
      await processChunk(chunk);
    }
  } else {
    // Process chunks with delays for background warming
    chunks.forEach((chunk, index) => {
      setTimeout(() => processChunk(chunk), index * 1000);
    });
  }
}
