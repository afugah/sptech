/**
 * Cached Products API Route
 *
 * Demonstrates advanced caching patterns with ISR, SWR, and
 * cache invalidation for product data on Vercel Edge Network.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { CACHE_DURATIONS, CACHE_TAGS } from '../../../../lib/cache/advanced-caching';
import { cacheService, withApiCache } from '../../../../lib/cache/cache-service';

// Use Edge Runtime for global distribution
export const runtime = 'edge';

interface ProductsQuery {
  category?: string;
  limit?: string;
  page?: string;
  sort?: string;
  filters?: string;
}

// Mock product data fetcher (replace with actual data source)
async function fetchProducts(query: ProductsQuery) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { category, limit = '20', page = '1', sort = 'name', filters } = query;

  // Mock product data structure
  const mockProducts = Array.from({ length: parseInt(limit) }, (_, index) => ({
    id: `product-${category || 'all'}-${parseInt(page) * parseInt(limit) + index}`,
    name: `Product ${index + 1}${category ? ` in ${category}` : ''}`,
    category: category || 'general',
    price: Math.floor(Math.random() * 1000) + 100,
    availability: Math.random() > 0.2 ? 'in-stock' : 'out-of-stock',
    image: `https://picsum.photos/300/300?random=${index}`,
    description: `High-quality product ${index + 1} with premium features`,
    sku: `SKU-${category || 'GEN'}-${String(index + 1).padStart(4, '0')}`,
    brand: ['SP Tech', 'Premium Brand', 'Luxury Collection'][index % 3],
    tags: ['jewelry', 'premium', 'handcrafted', 'swedish-design'],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return {
    products: mockProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 1000,
      pages: Math.ceil(1000 / parseInt(limit)),
    },
    sort,
    category,
    filters: filters ? JSON.parse(filters) : {},
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query: ProductsQuery = {
      category: searchParams.get('category') || undefined,
      limit: searchParams.get('limit') || '20',
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'name',
      filters: searchParams.get('filters') || undefined,
    };

    // Generate cache key based on query parameters
    const cacheKey = `products:${JSON.stringify(query)}`;

    // Use advanced caching with stale-while-revalidate
    const { data, headers } = await withApiCache(
      cacheKey,
      {
        ttl: CACHE_DURATIONS.PRODUCT_DATA,
        staleWhileRevalidate: CACHE_DURATIONS.PRODUCT_DATA * 4,
        revalidateOnStale: true,
        tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.INVENTORY, CACHE_TAGS.PRICING],
      },
      () => fetchProducts(query),
    );

    return NextResponse.json(data, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-Cache-Key': cacheKey,
        'X-Cache-Tags': [CACHE_TAGS.PRODUCTS, CACHE_TAGS.INVENTORY, CACHE_TAGS.PRICING].join(','),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, data } = body;

    switch (action) {
      case 'invalidate': {
        // Invalidate product-related cache
        const invalidated = cacheService.invalidateByTags([CACHE_TAGS.PRODUCTS]);

        return NextResponse.json({
          success: true,
          action: 'invalidate',
          invalidatedEntries: invalidated,
          timestamp: new Date().toISOString(),
        });
      }

      case 'update': {
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required for update' }, { status: 400 });
        }

        // Simulate product update
        console.warn(`Updating product ${productId}:`, data);

        // Invalidate related cache entries
        const updatedInvalidated = cacheService.invalidateByTags([CACHE_TAGS.PRODUCTS, CACHE_TAGS.INVENTORY]);

        return NextResponse.json({
          success: true,
          action: 'update',
          productId,
          invalidatedEntries: updatedInvalidated,
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Supported: invalidate, update' }, { status: 400 });
    }
  } catch (error) {
    console.error('Products POST error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
