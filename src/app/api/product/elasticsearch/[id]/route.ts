import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCurrencyForCountry } from '@/src/lib/constants/markets';

// Field definitions for different response types
const MINIMAL_FIELDS = [
  'id',
  'product_sku',
  'title',
  'fullSlug',
  'media',
  'viewData.prices',
  'productVariants.status',
  'productVariants.stock',
  'productVariants.regularPrices',
  'created_at',
];

const CARD_FIELDS = [...MINIMAL_FIELDS, 'tags', 'custom_fields'];

/**
 * Direct Elasticsearch API endpoint for fetching single products
 * Provides optimized field selection and query-level filtering
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const country = request.nextUrl.searchParams.get('country') || 'Sweden';
    const locale = request.nextUrl.searchParams.get('locale') || 'en';
    const fields = request.nextUrl.searchParams.get('fields') || 'full';

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Extract base URL and index from environment
    const searchAppUrl = process.env.SEARCH_ELASTIC_API_URL;
    if (!searchAppUrl) {
      throw new Error('SEARCH_ELASTIC_API_URL not configured');
    }

    // Extract the base Elasticsearch URL (before /_application)
    // Example: https://shoplab.kb.eu-west-1.aws.elastic-cloud.com:9243/_application/search_application/example_products_v2
    // We want: https://shoplab.kb.eu-west-1.aws.elastic-cloud.com:9243
    const baseUrl = searchAppUrl.split('/_application')[0];

    // The index name is embedded in the search application path
    // We'll use the actual index name directly
    const indexName = process.env.SEARCH_ELASTIC_INDEX || '';

    // Build Elasticsearch query with optimizations
    // Search by both id and product_sku fields to handle both ID types
    const searchQuery = {
      query: {
        bool: {
          should: [
            // Try matching by id as keyword (exact match)
            {
              term: {
                'id.keyword': String(id),
              },
            },
            // Try matching by id as text
            {
              match: {
                id: String(id),
              },
            },
            // Try matching by product_sku
            {
              term: {
                'product_sku.keyword': String(id),
              },
            },
            {
              match: {
                product_sku: String(id),
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
      _source: getSourceFields(fields),
      size: 1,
      track_total_hits: false, // Optimization: skip counting
      timeout: '2s', // Prevent long-running queries
    };

    // Execute search
    const searchUrl = `${baseUrl}/${indexName}/_search`;

    const elasticResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `apiKey ${process.env.SEARCH_ELASTIC_API_KEY}`, // Use lowercase apiKey
      },
      body: JSON.stringify(searchQuery),
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!elasticResponse.ok) {
      const errorText = await elasticResponse.text();
      throw new Error(`Elasticsearch API error: ${elasticResponse.status} - ${errorText}`);
    }

    const data = await elasticResponse.json();

    // Check if product found - filter for ACTIVE status
    // Note: Status is stored in productVariants array, not at top level
    const activeProduct = data.hits?.hits?.find((hit: { _source: Record<string, unknown> }) => {
      const product = hit._source;
      const variants = product.productVariants as Array<Record<string, unknown>> | undefined;
      // Check if any variant is ACTIVE
      return variants?.some((v) => v.status === 'ACTIVE');
    });

    if (!activeProduct) {
      return NextResponse.json(
        {
          error: `Product not found: ${id}`,
          debug: {
            searchedId: id,
            source: 'elasticsearch-direct',
            totalHits: data.hits?.hits?.length || 0,
            response: data,
          },
        },
        { status: 404 },
      );
    }

    const rawProduct = activeProduct._source;

    // Transform based on field selection
    const transformedProduct = transformProduct(rawProduct, fields, locale, country);

    // Create response with caching headers
    const response = NextResponse.json(transformedProduct);

    // Optimize caching based on field type
    if (fields === 'minimal' || fields === 'card') {
      // Longer cache for minimal data
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=120');
    } else {
      // Standard cache for full data
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    }

    // Add performance headers
    response.headers.set('X-Elasticsearch-Direct', 'true');
    response.headers.set('X-Response-Fields', fields);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          source: 'elasticsearch-direct',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Get source fields based on requested field set
 */
function getSourceFields(fields: string): string[] | boolean {
  switch (fields) {
    case 'minimal':
      return MINIMAL_FIELDS;
    case 'card':
      return CARD_FIELDS;
    case 'full':
    default:
      return true; // Return all fields
  }
}

/**
 * Transform Elasticsearch document to API response format
 */
function transformProduct(
  rawProduct: Record<string, unknown>,
  fields: string,
  locale: string,
  country: string,
): Record<string, unknown> {
  const language = locale.split('-')[0] || 'en';

  if (fields === 'minimal') {
    return transformMinimalProduct(rawProduct, language, country);
  } else if (fields === 'card') {
    return transformCardProduct(rawProduct, language, country);
  } else {
    return transformFullProduct(rawProduct, language, country);
  }
}

/**
 * Transform to minimal product format (optimized for lists)
 */
function transformMinimalProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  country: string,
): Record<string, unknown> {
  const currency = getCurrencyForCountry(country).toLowerCase();
  const productVariants = rawProduct.productVariants as Array<Record<string, unknown>> | undefined;
  const firstVariant = productVariants?.find((v) => v.status === 'ACTIVE');

  let price = 0;
  let compareAt = null;

  const viewData = rawProduct.viewData as Record<string, unknown> | undefined;
  const prices = viewData?.prices as Record<string, unknown> | undefined;

  if (prices) {
    const priceKey = `price_${currency}`;
    const salePriceKey = `sale_price_${currency}`;
    const discountKey = `discount_${currency}`;

    // Prices in viewData are already in major units
    const salePriceInMajorUnits = Number(prices[salePriceKey]) || 0;
    const priceInMajorUnits = Number(prices[priceKey]) || 0;
    price = salePriceInMajorUnits;

    if (prices[discountKey] !== '0' && priceInMajorUnits > salePriceInMajorUnits) {
      compareAt = priceInMajorUnits;
    }
  }

  return {
    id: String(rawProduct.id || ''),
    sku: String(rawProduct.product_sku || ''),
    title:
      (rawProduct.title as Record<string, string> | undefined)?.[language] ||
      (rawProduct.title as Record<string, string> | undefined)?.sv ||
      (rawProduct.title as Record<string, string> | undefined)?.en ||
      'Unknown Product',
    slug:
      (rawProduct.fullSlug as Record<string, string> | undefined)?.[language] ||
      (rawProduct.fullSlug as Record<string, string> | undefined)?.sv ||
      (rawProduct.fullSlug as Record<string, string> | undefined)?.en ||
      '',
    price: price,
    compareAt: compareAt,
    thumbnail: {
      url: ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[0]?.imageSrc as string) || '',
      hoverUrl:
        ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[1]?.imageSrc as string) ||
        ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[0]?.imageSrc as string) ||
        '',
    },
    stock: Number(firstVariant?.stock) || 0,
    created_at: String(rawProduct.created_at || ''),
    custom_fields: {
      [`price_${currency}`]: [price.toString()],
    },
  };
}

/**
 * Transform to card product format (for product cards)
 */
function transformCardProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  country: string,
): Record<string, unknown> {
  const minimal = transformMinimalProduct(rawProduct, language, country);

  return {
    ...minimal,
    tags: rawProduct.tags || [],
    custom_fields: extractCustomFields(rawProduct, country),
  };
}

/**
 * Transform to full product format (for product pages)
 */
function transformFullProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  country: string,
): Record<string, unknown> {
  const currency = getCurrencyForCountry(country).toLowerCase();
  const productVariants = rawProduct.productVariants as Array<Record<string, unknown>> | undefined;
  const firstVariant = productVariants?.find((v) => v.status === 'ACTIVE');

  const customFields: Record<string, string[]> = {};
  let mainPrice = 0;
  let compareAtPrice = null;
  let salePrice = 0;

  // Process pricing from viewData
  const viewData = rawProduct.viewData as Record<string, unknown> | undefined;
  const prices = viewData?.prices as Record<string, unknown> | undefined;

  if (prices) {
    ['sek', 'eur', 'nok', 'usd'].forEach((curr) => {
      const priceKey = `price_${curr}`;
      const salePriceKey = `sale_price_${curr}`;
      const discountKey = `discount_${curr}`;

      if (prices[priceKey] !== undefined) {
        const priceInMajorUnits = Number(prices[priceKey]);
        const salePriceInMajorUnits = Number(prices[salePriceKey]);

        customFields[priceKey] = [priceInMajorUnits.toString()];
        customFields[salePriceKey] = [salePriceInMajorUnits.toString()];
        customFields[discountKey] = [(prices[discountKey] || '0').toString()];

        if (curr === currency) {
          mainPrice = salePriceInMajorUnits;
          salePrice = salePriceInMajorUnits;
          if (prices[discountKey] !== '0' && priceInMajorUnits > salePriceInMajorUnits) {
            compareAtPrice = priceInMajorUnits;
          }
        }
      }
    });
  } else if (firstVariant && firstVariant.regularPrices) {
    // Fallback to old structure
    const regularPrices = firstVariant.regularPrices as Array<{ currency_code: string; price: number }>;
    regularPrices.forEach((priceData) => {
      const curr = priceData.currency_code.toLowerCase();
      const priceInMajorUnits = Math.round(priceData.price / 100);
      customFields[`price_${curr}`] = [priceInMajorUnits.toString()];
    });

    const priceInCents = regularPrices.find((p) => p.currency_code === currency.toUpperCase())?.price || 0;
    mainPrice = Math.round(priceInCents / 100);
    salePrice = mainPrice;
  }

  return {
    id: String(rawProduct.id || ''),
    key: String(rawProduct.id || ''),
    sku: String(rawProduct.product_sku || ''),
    title:
      (rawProduct.title as Record<string, string> | undefined)?.[language] ||
      (rawProduct.title as Record<string, string> | undefined)?.sv ||
      (rawProduct.title as Record<string, string> | undefined)?.en ||
      'Unknown Product',
    display_name:
      (rawProduct.title as Record<string, string> | undefined)?.[language] ||
      (rawProduct.title as Record<string, string> | undefined)?.sv ||
      (rawProduct.title as Record<string, string> | undefined)?.en ||
      'Unknown Product',
    created_at: String(rawProduct.created_at || ''),
    thumbnail: {
      url: ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[0]?.imageSrc as string) || '',
      hoverUrl:
        ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[1]?.imageSrc as string) ||
        ((rawProduct.media as Array<Record<string, unknown>> | undefined)?.[0]?.imageSrc as string) ||
        '',
    },
    status: 'ACTIVE',
    slug:
      (rawProduct.fullSlug as Record<string, string> | undefined)?.[language] ||
      (rawProduct.fullSlug as Record<string, string> | undefined)?.sv ||
      (rawProduct.fullSlug as Record<string, string> | undefined)?.en ||
      '',
    stock: Number(firstVariant?.stock) || 0,
    price: mainPrice,
    compareAt: compareAtPrice,
    salePrice: salePrice ? [salePrice.toString()] : [mainPrice.toString()],
    tags: [],
    otherColors: [],
    sizes: [],
    onlinedate: null,
    coming_soon_publish_date: null,
    new_until_date: null,
    pricing: undefined,
    custom_fields: customFields,
    viewData: rawProduct.viewData,
    productVariants: rawProduct.productVariants,
  };
}

/**
 * Extract custom fields from product
 */
function extractCustomFields(rawProduct: Record<string, unknown>, _country: string): Record<string, string[]> {
  const customFields: Record<string, string[]> = {};

  const viewData = rawProduct.viewData as Record<string, unknown> | undefined;
  const prices = viewData?.prices as Record<string, unknown> | undefined;

  if (prices) {
    ['sek', 'eur', 'nok', 'usd'].forEach((curr) => {
      const priceKey = `price_${curr}`;
      const salePriceKey = `sale_price_${curr}`;
      const discountKey = `discount_${curr}`;

      if (prices[priceKey] !== undefined) {
        const priceInMajorUnits = Number(prices[priceKey]);
        const salePriceInMajorUnits = Number(prices[salePriceKey]);

        customFields[priceKey] = [priceInMajorUnits.toString()];
        customFields[salePriceKey] = [salePriceInMajorUnits.toString()];
        customFields[discountKey] = [(prices[discountKey] || '0').toString()];
      }
    });
  }

  return customFields;
}
