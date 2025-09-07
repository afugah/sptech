import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCurrencyForCountry } from '@/src/lib/constants/markets';
import { di } from '@/src/lib/di';
import { Tokens } from '@/src/lib/diTokens';

/**
 * Elasticsearch Product API
 *
 * This endpoint searches for products by ID field in Elasticsearch.
 * Note: The parameter is called 'id' but callers may pass either:
 * - Numeric product IDs (from Storyblok/CMS)
 * - SKU strings (from product data)
 *
 * The Elasticsearch index uses the 'id' field for both cases, so we search
 * by that field regardless of what type of identifier is passed.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    // Get country from query param, or use default
    const country = request.nextUrl.searchParams.get('country') || 'Sweden';
    const locale = request.nextUrl.searchParams.get('locale') || 'en';
    // Allow consumers to specify which fields they need
    // Options: 'minimal' (for StoryblokProductCard), 'full' (default, for ProductPageClient)
    const fields = request.nextUrl.searchParams.get('fields') || 'full';

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
      // Fetch raw data directly from Elastic to get pricing information
      // The ElasticSearchRepository doesn't populate prices (they come from Brink)
      // but the raw Elastic data does contain price information
      const config = di.resolve(Tokens.Configuration);
      const { ApiUrl, ApiKey } = config.Search.ElasticSearch;

      // Use the search application URL directly from environment variable
      // The URL already contains the full path including /_application/search_application/...
      // We just need to append /_search to the base search application
      const searchUrl = `${ApiUrl}/_search`;

      // Use the params structure that the Elasticsearch search application expects
      // The search application uses params object, not query object
      // Note: Search Application API doesn't support _source filtering
      // Ensure ID is passed as a string
      const searchQuery = {
        params: { id: String(id) }, // Search by id field - ensure it's a string
      };

      const elasticResponse = await fetch(searchUrl, {
        method: 'POST',
        body: JSON.stringify(searchQuery),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `apiKey ${ApiKey}`,
        },
      });

      if (!elasticResponse.ok) {
        throw new Error(`ElasticSearch API error: ${elasticResponse.status}`);
      }

      const elasticData = await elasticResponse.json();

      // Find the first ACTIVE product
      // TODO: This should ideally be done at the query level with filters
      const hit = elasticData.hits?.hits?.find((h: { _source: { status: string } }) => h._source.status === 'ACTIVE');

      if (!hit) {
        throw new Error(`Product not found for ID: ${id}`);
      }

      const rawProduct = hit._source;

      // For minimal fields, return only what StoryblokProductCard needs
      if (fields === 'minimal') {
        const language = locale.split('-')[0] || 'en';
        const currency = getCurrencyForCountry(country).toLowerCase();
        const firstVariant = rawProduct.productVariants?.find((v: { status: string }) => v.status === 'ACTIVE');

        // Simple price extraction for minimal response
        let price = 0;
        let compareAt = null;

        if (rawProduct.viewData?.prices) {
          // Use the correct currency based on the market/locale
          const priceKey = `price_${currency}`;
          const salePriceKey = `sale_price_${currency}`;
          const discountKey = `discount_${currency}`;

          // Prices in viewData are already in major units (SEK/EUR/NOK/USD, not öre/cents)
          const salePriceInMajorUnits = rawProduct.viewData.prices[salePriceKey] || 0;
          const priceInMajorUnits = rawProduct.viewData.prices[priceKey] || 0;
          price = salePriceInMajorUnits;

          if (rawProduct.viewData.prices[discountKey] !== '0' && priceInMajorUnits > salePriceInMajorUnits) {
            compareAt = priceInMajorUnits;
          }
        }

        const minimalProduct = {
          id: rawProduct.id.toString(),
          sku: rawProduct.product_sku,
          title: rawProduct.title?.[language] || rawProduct.title?.sv || rawProduct.title?.en || 'Unknown Product',
          slug: rawProduct.fullSlug?.[language] || rawProduct.fullSlug?.sv || rawProduct.fullSlug?.en || '',
          price: price,
          compareAt: compareAt,
          thumbnail: {
            url: rawProduct.media?.[0]?.imageSrc || '',
            hoverUrl: rawProduct.media?.[1]?.imageSrc || rawProduct.media?.[0]?.imageSrc || '',
          },
          tags: [],
          created_at: rawProduct.created_at,
          stock: firstVariant?.stock || 0,
          custom_fields: {
            [`price_${currency}`]: [price.toString()],
          },
        };

        const response = NextResponse.json(minimalProduct);
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
        return response;
      }

      // Full response for ProductPageClient and other consumers
      // Extract price from the first active variant's regularPrices
      const firstVariant = rawProduct.productVariants?.find((v: { status: string }) => v.status === 'ACTIVE');

      // Get the correct currency for this market/country
      const marketCurrency = getCurrencyForCountry(country).toLowerCase();

      // Extract all currency prices from viewData.prices (new structure)
      const customFields: Record<string, string[]> = {};
      let mainPrice = 0;
      let compareAtPrice = null;
      let salePrice = 0;

      // Check if we have the new pricing structure in viewData
      if (rawProduct.viewData?.prices) {
        const prices = rawProduct.viewData.prices;

        // Process each currency from the new pricing structure
        ['sek', 'eur', 'nok', 'usd'].forEach((currency) => {
          const priceKey = `price_${currency}`;
          const salePriceKey = `sale_price_${currency}`;
          const discountKey = `discount_${currency}`;

          if (prices[priceKey] !== undefined) {
            // Prices in viewData are already in major units (SEK/EUR/NOK/USD, not öre/cents)
            const priceInMajorUnits = prices[priceKey];
            const salePriceInMajorUnits = prices[salePriceKey];

            customFields[`price_${currency}`] = [priceInMajorUnits.toString()];
            customFields[`sale_price_${currency}`] = [salePriceInMajorUnits.toString()];
            customFields[`discount_${currency}`] = [prices[discountKey] || '0'];

            // Set the main price based on the market's currency
            if (currency === marketCurrency) {
              mainPrice = salePriceInMajorUnits; // Use sale price as the current price
              salePrice = salePriceInMajorUnits;
              // If there's a discount, set the compare price
              if (prices[discountKey] !== '0' && priceInMajorUnits > salePriceInMajorUnits) {
                compareAtPrice = priceInMajorUnits;
              }
            }
          }
        });
      } else if (firstVariant?.regularPrices) {
        // Fallback to old structure if viewData.prices doesn't exist
        firstVariant.regularPrices.forEach((priceData: { currency_code: string; price: number }) => {
          const currency = priceData.currency_code.toLowerCase();
          // Convert from minor units (cents) to major units for display
          const priceInMajorUnits = Math.round(priceData.price / 100);
          customFields[`price_${currency}`] = [priceInMajorUnits.toString()];
        });

        // Get price in the market's currency - convert to major units
        const priceInCents =
          firstVariant?.regularPrices?.find(
            (p: { currency_code: string; price: number }) => p.currency_code === marketCurrency.toUpperCase(),
          )?.price || 0;
        mainPrice = Math.round(priceInCents / 100);
        salePrice = mainPrice;
      }

      // Get localized strings based on locale
      const language = locale.split('-')[0] || 'en'; // Use the locale language part

      // Transform to consistent format similar to Findify response
      const transformedProduct = {
        id: rawProduct.id.toString(),
        key: rawProduct.id.toString(),
        sku: rawProduct.product_sku,
        title: rawProduct.title?.[language] || rawProduct.title?.sv || rawProduct.title?.en || 'Unknown Product',
        display_name: rawProduct.title?.[language] || rawProduct.title?.sv || rawProduct.title?.en || 'Unknown Product',
        created_at: rawProduct.created_at,
        thumbnail: {
          url: rawProduct.media?.[0]?.imageSrc || '',
          hoverUrl: rawProduct.media?.[1]?.imageSrc || rawProduct.media?.[0]?.imageSrc || '',
        },
        status: 'ACTIVE',
        slug: rawProduct.fullSlug?.[language] || rawProduct.fullSlug?.sv || rawProduct.fullSlug?.en || '',
        stock: firstVariant?.stock || 0,
        price: mainPrice, // Use sale price as the main price
        compareAt: compareAtPrice, // Original price if there's a discount
        salePrice: salePrice ? [salePrice.toString()] : [mainPrice.toString()],
        tags: [],
        otherColors: [],
        sizes: [],
        onlinedate: null,
        coming_soon_publish_date: null,
        new_until_date: null,
        pricing: undefined,
        custom_fields: customFields, // Contains all currency prices, sale prices, and discounts
        // Add viewData for compatibility
        viewData: rawProduct.viewData,
        // Include productVariants for stock checking
        productVariants: rawProduct.productVariants,
      };

      // Cache the response for 5 minutes to reduce Elasticsearch load
      // This is especially useful for ShoplabProducts components in Storyblok
      const response = NextResponse.json(transformedProduct);

      // Set cache headers
      // s-maxage=300: Cache on CDN for 5 minutes
      // stale-while-revalidate=60: Serve stale content for up to 1 minute while revalidating
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');

      return response;
    } catch {
      return NextResponse.json(
        {
          error: `Product not found in Elastic search: ${id}`,
          debug: { searchedSku: id, source: 'elastic' },
        },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          source: 'elastic',
        },
      },
      { status: 500 },
    );
  }
}
