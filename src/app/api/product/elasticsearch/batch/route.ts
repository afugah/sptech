import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCurrencyForCountry } from '@/src/lib/constants/markets';

// Reuse field definitions
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
  'productVariants.attributes', // Include attributes for stock type evaluation
  'created_at',
];

const CARD_FIELDS = [...MINIMAL_FIELDS, 'tags', 'custom_fields', 'attributes'];

/**
 * Batch fetch multiple products in a single request
 * Optimized for performance with minimal field selection
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { ids, fields = 'minimal', locale = 'en', country = 'Sweden', includeInactive = false } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Product IDs array is required' }, { status: 400 });
    }

    // Limit batch size to prevent overload
    if (ids.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 products per batch request' }, { status: 400 });
    }

    // Extract configuration
    const searchAppUrl = process.env.SEARCH_ELASTIC_API_URL;
    if (!searchAppUrl) {
      throw new Error('SEARCH_ELASTIC_API_URL not configured');
    }
    const baseUrl = searchAppUrl.split('/_application')[0];
    const indexName = process.env.SEARCH_ELASTIC_INDEX || '';

    // Build optimized batch query
    const searchQuery = {
      query: {
        bool: {
          must: [
            {
              terms: {
                id: ids.map(String), // Ensure all IDs are strings
                boost: 1.0,
              },
            },
          ],
          ...(!includeInactive && {
            filter: [
              {
                term: {
                  status: 'ACTIVE',
                },
              },
            ],
          }),
        },
      },
      _source: getSourceFields(fields),
      size: ids.length,
      track_total_hits: false,
      timeout: '5s',
    };

    // Execute search
    const elasticResponse = await fetch(`${baseUrl}/${indexName}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `apiKey ${process.env.SEARCH_ELASTIC_API_KEY}`, // Use lowercase apiKey
      },
      body: JSON.stringify(searchQuery),
    });

    if (!elasticResponse.ok) {
      throw new Error(`Elasticsearch API error: ${elasticResponse.status}`);
    }

    const data = await elasticResponse.json();

    // Transform all products
    const products =
      data.hits?.hits?.map((hit: { _source: Record<string, unknown> }) =>
        transformProduct(hit._source, fields, locale, country),
      ) || [];

    // Create ID map for client convenience
    const productMap = products.reduce((acc: Record<string, unknown>, product: Record<string, unknown>) => {
      const productId = String(product.id || '');
      if (productId) {
        acc[productId] = product;
      }
      return acc;
    }, {});

    // Response with statistics
    const response = NextResponse.json({
      products,
      productMap,
      meta: {
        requested: ids.length,
        found: products.length,
        missing: ids.filter((id) => !productMap[String(id)]),
      },
    });

    // Cache batch requests briefly
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    response.headers.set('X-Elasticsearch-Direct', 'true');
    response.headers.set('X-Batch-Size', products.length.toString());

    return response;
  } catch (error) {
    console.error('Batch Elasticsearch error:', error);
    return NextResponse.json(
      {
        error: 'Batch request failed',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
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
      return true;
  }
}

/**
 * Transform product based on field selection
 */
function transformProduct(
  rawProduct: Record<string, unknown>,
  fields: string,
  locale: string,
  country: string,
): Record<string, unknown> {
  const language = locale.split('-')[0] || 'en';
  const currency = getCurrencyForCountry(country).toLowerCase();

  if (fields === 'minimal') {
    return transformMinimalProduct(rawProduct, language, currency);
  } else if (fields === 'card') {
    return transformCardProduct(rawProduct, language, currency);
  } else {
    return transformFullProduct(rawProduct, language, currency, country);
  }
}

function transformMinimalProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  currency: string,
): Record<string, unknown> {
  const productVariants = rawProduct.productVariants as Array<{ status: string; stock?: number }> | undefined;
  const firstVariant = productVariants?.find((v) => v.status === 'ACTIVE');

  let price = 0;
  let compareAt = null;

  const viewData = rawProduct.viewData as Record<string, unknown> | undefined;
  const prices = viewData?.prices as Record<string, unknown> | undefined;

  if (prices) {
    const priceKey = `price_${currency}`;
    const salePriceKey = `sale_price_${currency}`;
    const discountKey = `discount_${currency}`;

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
    stock: firstVariant?.stock || 0,
    created_at: String(rawProduct.created_at || ''),
  };
}

function transformCardProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  currency: string,
): Record<string, unknown> {
  const minimal = transformMinimalProduct(rawProduct, language, currency);

  const customFields: Record<string, string[]> = {};
  const viewData = rawProduct.viewData as Record<string, unknown> | undefined;
  const prices = viewData?.prices as Record<string, unknown> | undefined;

  if (prices) {
    const priceInMajorUnits = Number(prices[`price_${currency}`]) || 0;
    const salePriceInMajorUnits = Number(prices[`sale_price_${currency}`]) || 0;
    const discount = (prices[`discount_${currency}`] || '0').toString();

    customFields[`price_${currency}`] = [priceInMajorUnits.toString()];
    customFields[`sale_price_${currency}`] = [salePriceInMajorUnits.toString()];
    customFields[`discount_${currency}`] = [discount];
  }

  return {
    ...minimal,
    tags: rawProduct.tags || [],
    custom_fields: customFields,
  };
}

function transformFullProduct(
  rawProduct: Record<string, unknown>,
  language: string,
  currency: string,
  _country: string,
): Record<string, unknown> {
  // Similar to single product endpoint's full transformation
  // Simplified here for brevity - in production would match the single endpoint
  return {
    ...transformCardProduct(rawProduct, language, currency),
    viewData: rawProduct.viewData,
    // Include productVariants with all attributes for stock checking
    productVariants: (rawProduct.productVariants as Array<Record<string, unknown>> | undefined)?.map((variant) => ({
      ...variant,
      attributes: variant.attributes || {}, // Ensure attributes are included
    })),
    // Include raw attributes for debugging
    attributes: rawProduct.attributes,
  };
}
