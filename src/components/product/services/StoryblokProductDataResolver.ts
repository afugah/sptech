import 'server-only';
import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { getMarketCode } from '@/src/util/locale';

export interface StoryblokProductData {
  slug: string | null;
  sku: string | null;
}

/**
 * Resolves missing product data for StoryblokProductCard when Storyblok data is incomplete.
 * This is specifically for cases where Storyblok doesn't have the full product information.
 * Uses exact SKU matching to prevent fuzzy search issues.
 */
export async function getStoryblokProductData(locale: string, productId: string): Promise<StoryblokProductData> {
  try {
    const collectionService = di.resolve(CollectionService);
    const marketCode = getMarketCode(locale);

    // Searching for exact SKU match in Findify

    // Use getItems with query filter for better control (same approach as our API endpoint)
    const result = await collectionService.getItems(
      marketCode,
      {
        query: productId, // Search query
      },
      undefined, // no sorting
      { page: 0, take: 10 }, // Get more results to check for exact matches
    );

    if (!result.items || result.items.length === 0) {
      console.warn(`[StoryblokProductDataResolver] No products found for SKU: ${productId}`);
      return {
        slug: null,
        sku: null,
      };
    }

    // Find exact SKU match in the results (same logic as our API endpoint)
    const exactMatch = result.items.find(
      (item) => item.sku === productId || item.id === productId || (item.sku && item.sku.startsWith(productId)), // Handle variant SKUs
    );

    if (!exactMatch) {
      console.warn(
        `[StoryblokProductDataResolver] No exact match found for SKU: ${productId}. Found ${result.items.length} results but none matched exactly.`,
      );
      console.warn(
        `[StoryblokProductDataResolver] Search results:`,
        result.items.map((item) => ({ id: item.id, sku: item.sku, title: item.title })),
      );
      return {
        slug: null,
        sku: null,
      };
    }

    // Found exact match, returning product data

    return {
      slug: exactMatch.slug || null,
      sku: exactMatch.sku || null,
    };
  } catch (error) {
    console.error(`[StoryblokProductDataResolver] Failed to resolve product data for ID ${productId}:`, error);
    return {
      slug: null,
      sku: null,
    };
  }
}
