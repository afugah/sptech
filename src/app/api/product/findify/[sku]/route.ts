import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { getMarketCode } from '@/src/util/locale';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> },
): Promise<NextResponse> {
  try {
    const { sku } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || 'se-sv';

    if (!sku) {
      return NextResponse.json({ error: 'SKU parameter is required' }, { status: 400 });
    }

    // Searching for exact SKU match in Findify

    // Get collection service and market code
    const collectionService = di.resolve(CollectionService);
    const marketCode = getMarketCode(locale);

    // Use getItems with query filter for better control
    const result = await collectionService.getItems(
      marketCode,
      {
        query: sku, // Search query
      },
      undefined, // no sorting
      { page: 0, take: 10 }, // Get more results to check for exact matches
    );

    if (!result.items || result.items.length === 0) {
      console.warn(`[Findify API] No products found for SKU: ${sku}`);
      return NextResponse.json(
        {
          error: `No products found for SKU: ${sku}`,
          debug: { searchedSku: sku, resultCount: 0 },
        },
        { status: 404 },
      );
    }

    // Find exact SKU match in the results
    const exactMatch = result.items.find(
      (item) => item.sku === sku || item.id === sku || (item.sku && item.sku.startsWith(sku)), // Handle variant SKUs like "10-102-01303-4245" matching "10-102-01303"
    );

    if (!exactMatch) {
      console.warn(
        `[Findify API] No exact match found for SKU: ${sku}. Found ${result.items.length} results but none matched exactly.`,
      );
      console.warn(
        `[Findify API] Search results:`,
        result.items.map((item) => ({ id: item.id, sku: item.sku, title: item.title })),
      );

      return NextResponse.json(
        {
          error: `No exact match found for SKU: ${sku}`,
          debug: {
            searchedSku: sku,
            resultCount: result.items.length,
            foundSkus: result.items.map((item) => item.sku).slice(0, 5),
          },
        },
        { status: 404 },
      );
    }

    // Found exact match, returning product data

    return NextResponse.json(exactMatch);
  } catch (error) {
    console.error('[Findify API] Error fetching Findify product data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: { message: error instanceof Error ? error.message : 'Unknown error' },
      },
      { status: 500 },
    );
  }
}
