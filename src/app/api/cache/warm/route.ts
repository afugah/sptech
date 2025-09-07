/**
 * Cache Warming API Route
 *
 * Pre-populates cache with critical pages and data for optimal
 * performance on Vercel Edge Network.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_WARMING_PRIORITY } from '../../../../lib/cache/advanced-caching';

// Use Edge Runtime for distributed cache warming
export const runtime = 'edge';

interface WarmRequest {
  priority?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  secret?: string;
  pages?: string[];
}

const WARM_SECRET = process.env.WARM_SECRET || 'dev-warm-secret';

// Base URL for the application
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: WarmRequest = await request.json();
    const { priority = 'critical', secret, pages: customPages } = body;

    // Verify secret token
    if (secret !== WARM_SECRET) {
      return NextResponse.json({ error: 'Invalid warming secret' }, { status: 401 });
    }

    const baseUrl = getBaseUrl(request);

    // Determine pages to warm based on priority
    let pagesToWarm: string[] = [];

    if (customPages) {
      pagesToWarm = customPages;
    } else {
      switch (priority) {
        case 'all':
          pagesToWarm = [
            ...CACHE_WARMING_PRIORITY.CRITICAL,
            ...CACHE_WARMING_PRIORITY.HIGH,
            ...CACHE_WARMING_PRIORITY.MEDIUM,
            ...CACHE_WARMING_PRIORITY.LOW,
          ];
          break;
        case 'critical':
          pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL];
          break;
        case 'high':
          pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL, ...CACHE_WARMING_PRIORITY.HIGH];
          break;
        case 'medium':
          pagesToWarm = [
            ...CACHE_WARMING_PRIORITY.CRITICAL,
            ...CACHE_WARMING_PRIORITY.HIGH,
            ...CACHE_WARMING_PRIORITY.MEDIUM,
          ];
          break;
        case 'low':
          pagesToWarm = [...CACHE_WARMING_PRIORITY.LOW];
          break;
        default:
          pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL];
      }
    }

    console.warn(`Starting cache warming for ${pagesToWarm.length} pages with priority: ${priority}`);

    // Warm pages in parallel with controlled concurrency
    const warmingResults = await Promise.allSettled(
      pagesToWarm.map(async (path) => {
        const url = `${baseUrl}${path}`;

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Cache-Warmer/1.0',
              'Cache-Control': 'no-cache',
            },
          });

          return {
            path,
            url,
            status: response.status,
            success: response.ok,
            size: response.headers.get('content-length') || '0',
          };
        } catch (error) {
          return {
            path,
            url,
            status: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    // Process results
    const results = warmingResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          path: pagesToWarm[index],
          success: false,
          error: result.reason,
        };
      }
    });

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.warn(`Cache warming completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json(
      {
        success: true,
        priority,
        totalPages: pagesToWarm.length,
        successful,
        failed,
        results,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Cache warming error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error during cache warming',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const priority = (searchParams.get('priority') as WarmRequest['priority']) || 'critical';
  const secret = searchParams.get('secret');

  if (secret !== WARM_SECRET) {
    return NextResponse.json({ error: 'Invalid warming secret' }, { status: 401 });
  }

  // Return the pages that would be warmed for the given priority
  let pagesToWarm: string[] = [];

  switch (priority) {
    case 'all':
      pagesToWarm = [
        ...CACHE_WARMING_PRIORITY.CRITICAL,
        ...CACHE_WARMING_PRIORITY.HIGH,
        ...CACHE_WARMING_PRIORITY.MEDIUM,
        ...CACHE_WARMING_PRIORITY.LOW,
      ];
      break;
    case 'critical':
      pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL];
      break;
    case 'high':
      pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL, ...CACHE_WARMING_PRIORITY.HIGH];
      break;
    case 'medium':
      pagesToWarm = [
        ...CACHE_WARMING_PRIORITY.CRITICAL,
        ...CACHE_WARMING_PRIORITY.HIGH,
        ...CACHE_WARMING_PRIORITY.MEDIUM,
      ];
      break;
    case 'low':
      pagesToWarm = [...CACHE_WARMING_PRIORITY.LOW];
      break;
    default:
      pagesToWarm = [...CACHE_WARMING_PRIORITY.CRITICAL];
  }

  return NextResponse.json(
    {
      priority,
      pages: pagesToWarm,
      count: pagesToWarm.length,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    },
  );
}
