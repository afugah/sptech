/**
 * Manual Cache Invalidation API Endpoint
 *
 * Provides programmatic access to cache invalidation functionality
 * for debugging, manual revalidation, and integration testing
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/src/lib/cache/cache-service';
import { ISR_TAGS } from '@/src/lib/isr/isr-config';
import { STORYBLOK_CACHE_TAGS } from '@/src/lib/storyblok/cachedStoryblokFetcher';

interface CacheInvalidationRequest {
  type: 'tags' | 'paths' | 'all' | 'memory';
  targets?: string[];
  reason?: string;
}

/**
 * Verify API key for cache invalidation
 */
function verifyApiKey(authHeader: string | null): boolean {
  if (!authHeader || !process.env.CACHE_INVALIDATION_API_KEY) {
    return false;
  }

  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === process.env.CACHE_INVALIDATION_API_KEY;
}

/**
 * Handle cache invalidation requests
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization in production
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (process.env.NODE_ENV === 'production' && !verifyApiKey(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CacheInvalidationRequest = await request.json();
    const { type, targets = [], reason = 'Manual invalidation' } = body;

    const results: Record<string, unknown> = {
      type,
      reason,
      timestamp: new Date().toISOString(),
      invalidated: [],
    };

    switch (type) {
      case 'tags': {
        // Invalidate specific cache tags (supports both ISR and Storyblok cache tags)
        const allValidTags: string[] = [...Object.values(STORYBLOK_CACHE_TAGS), ...Object.values(ISR_TAGS)];
        const validTags = targets.filter((tag): tag is string => typeof tag === 'string' && allValidTags.includes(tag));

        for (const tag of validTags) {
          revalidateTag(tag);
          console.warn(`Cache tag invalidated: ${tag} (${reason})`);
        }

        // Also invalidate from memory cache
        const memoryInvalidated = cacheService.invalidateByTags(validTags);

        results.invalidated = validTags;
        results.memory_invalidated = memoryInvalidated;
        break;
      }

      case 'paths': {
        // Invalidate specific paths
        for (const path of targets) {
          revalidatePath(path);
          console.warn(`Cache path invalidated: ${path} (${reason})`);
        }

        results.invalidated = targets;
        break;
      }

      case 'all': {
        // Invalidate all cache tags (both ISR and Storyblok)
        const allTags = [...Object.values(STORYBLOK_CACHE_TAGS), ...Object.values(ISR_TAGS)];
        for (const tag of allTags) {
          revalidateTag(tag);
        }

        // Clear memory cache
        cacheService.clear();

        results.invalidated = allTags;
        results.memory_cleared = true;
        console.warn(`All caches invalidated (${reason})`);
        break;
      }

      case 'memory': {
        // Clear only memory cache
        cacheService.clear();
        results.memory_cleared = true;
        console.warn(`Memory cache cleared (${reason})`);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid invalidation type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json({ error: 'Cache invalidation failed' }, { status: 500 });
  }
}

/**
 * Get cache status and statistics
 */
export async function GET() {
  try {
    const memoryStats = cacheService.getStats();

    return NextResponse.json({
      status: 'active',
      memory_cache: memoryStats,
      available_tags: {
        storyblok: Object.values(STORYBLOK_CACHE_TAGS),
        isr: Object.values(ISR_TAGS),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache status error:', error);
    return NextResponse.json({ error: 'Failed to get cache status' }, { status: 500 });
  }
}
