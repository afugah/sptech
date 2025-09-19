import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCurrencyForCountry } from '@/src/lib/constants/markets';

// Field definitions for different response types - Updated for actual Typesense structure
const MINIMAL_FIELDS = [
  'id',
  'sku',
  'title',
  'description',
  'image_url',
  'hover_image_url',
  'images',
  'prices',
  'product_urls',
  'variants',
  'availability',
  'in_stock',
  'created_at_timestamp',
  'updated_at_timestamp',
  'variant_count',
  'product_group_products', // Added for color selector support
  'product_group_identifier',
  'attributes', // Needed for color information in product groups
];

const CARD_FIELDS = [...MINIMAL_FIELDS, 'tags', 'custom_fields', 'collections', 'breadcrumbs', 'custom_attributes'];

/**
 * Direct Typesense API endpoint for fetching single products
 * Provides optimized field selection and native Typesense search
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

    // Get Typesense configuration from environment
    const typesenseHost = process.env.SEARCH_TYPESENSE_HOST;
    const typesensePort = process.env.SEARCH_TYPESENSE_PORT;
    const typesenseProtocol = process.env.SEARCH_TYPESENSE_PROTOCOL;
    const typesenseApiKey = process.env.SEARCH_TYPESENSE_API_KEY;
    const typesenseCollection = process.env.SEARCH_TYPESENSE_COLLECTION || 'products';

    if (!typesenseHost || !typesensePort || !typesenseProtocol || !typesenseApiKey) {
      throw new Error('Typesense configuration not found in environment variables');
    }

    // Build Typesense search URL
    const typesenseUrl = `${typesenseProtocol}://${typesenseHost}:${typesensePort}/collections/${typesenseCollection}/documents/search`;

    // Build Typesense search query
    // Try to match by id OR sku since Storyblok might use different IDs
    const searchParams = new URLSearchParams({
      q: '*',
      filter_by: `id:=${id} || sku:=${id}`, // Match by id, sku, or product_sku
      limit: '10', // Get more results to find the right product
    });

    // Only add include_fields if not fetching all fields
    if (fields !== 'full') {
      searchParams.append('include_fields', getTypesenseFields(fields).join(','));
    }

    // Query logging removed - production ready

    // Execute search
    const typesenseResponse = await fetch(`${typesenseUrl}?${searchParams}`, {
      method: 'GET',
      headers: {
        'X-TYPESENSE-API-KEY': typesenseApiKey,
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!typesenseResponse.ok) {
      const errorText = await typesenseResponse.text();
      throw new Error(`Typesense API error: ${typesenseResponse.status} - ${errorText}`);
    }

    const data = await typesenseResponse.json();

    // Response logging removed - production ready

    // Check if product found - look for exact match
    let activeProduct = data.hits?.find((hit: { document: Record<string, unknown> }) => {
      const doc = hit.document;
      // Try multiple fields for matching
      return (
        String(doc.id) === String(id) ||
        String(doc.product_sku) === String(id) ||
        String(doc.sku) === String(id) ||
        String(doc.external_id) === String(id) // Also check external_id
      );
    });

    // If no exact match, take the first result
    if (!activeProduct && data.hits?.length > 0) {
      activeProduct = data.hits[0];
    }

    if (!activeProduct) {
      // In development, provide detailed debug information
      const debugInfo =
        process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
          ? {
              searchedId: id,
              source: 'typesense-direct',
              totalHits: data.found || 0,
              query: {
                q: '*',
                filter_by: `id:=${id} || sku:=${id} || product_sku:=${id}`,
                searchParams: Object.fromEntries(searchParams),
              },
              typesenseUrl,
              collection: typesenseCollection,
              hits: data.hits?.map((hit: { document: Record<string, unknown> }) => ({
                id: hit.document.id,
                sku: hit.document.sku,
                product_sku: hit.document.product_sku,
                external_id: hit.document.external_id,
                title: hit.document.title,
              })),
            }
          : {
              searchedId: id,
              source: 'typesense-direct',
            };

      return NextResponse.json(
        {
          error: `Product not found: ${id}`,
          debug: debugInfo,
        },
        { status: 404 },
      );
    }

    const rawProduct = activeProduct.document;

    // Product logging removed - production ready

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
    response.headers.set('X-Typesense-Direct', 'true');
    response.headers.set('X-Response-Fields', fields);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          source: 'typesense-direct',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Get source fields based on requested field set for Typesense
 */
function getTypesenseFields(fields: string): string[] {
  switch (fields) {
    case 'minimal':
      return MINIMAL_FIELDS;
    case 'card':
      return CARD_FIELDS;
    case 'full':
    default:
      return ['*']; // Return all fields
  }
}

/**
 * Transform Typesense document to API response format
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

  // Handle Typesense structure - variants array
  const variants = rawProduct.variants as Array<Record<string, unknown>> | undefined;
  // const firstVariant = variants?.[0]; // Currently unused

  let price = 0;
  let compareAt = null;

  // Check for Typesense prices structure
  const typesensePrices = rawProduct.prices as
    | Record<string, { salePrice?: number; regularPrice?: number; currency?: string }>
    | undefined;
  if (typesensePrices) {
    // Build market key like "europe_SE" based on country code
    const countryCode = getCountryCode(country);

    // Find the price for the current market
    const marketKey = Object.keys(typesensePrices).find((key) => {
      // Match keys like "europe_SE", "europe_NO", etc.
      return key.endsWith(`_${countryCode}`);
    });

    if (marketKey) {
      const marketPrice = typesensePrices[marketKey];
      price = marketPrice.salePrice || marketPrice.regularPrice || 0;
      if (
        marketPrice.regularPrice &&
        marketPrice.salePrice &&
        marketPrice.regularPrice > marketPrice.salePrice &&
        marketPrice.salePrice > 0
      ) {
        compareAt = marketPrice.regularPrice;
      }
    }
  }

  // Handle SKU - Typesense uses 'sku' field directly
  const sku = String(rawProduct.sku || '');

  // Handle title - it's an object with language keys in Typesense
  const titleObj = rawProduct.title as Record<string, string> | string | undefined;
  const title =
    typeof titleObj === 'object' && titleObj !== null
      ? titleObj[language] || titleObj.en || Object.values(titleObj)[0] || 'Unknown Product'
      : String(titleObj || 'Unknown Product');

  // Handle slug - Typesense uses product_urls object with market keys
  const productUrls = rawProduct.product_urls as Record<string, string> | undefined;
  const countryCode = getCountryCode(country);
  let slug = `/products/${sku}`;

  if (productUrls) {
    // Find URL for current market
    const marketKey = Object.keys(productUrls).find((key) => key.endsWith(`_${countryCode}`));
    if (marketKey && productUrls[marketKey]) {
      const url = productUrls[marketKey];
      // Remove locale prefix if present (e.g., /se/products/... -> /products/...)
      slug = url.replace(/^\/[a-z]{2}\/products\//, '/products/');
    } else {
      // Fallback to first available URL
      const firstUrl = Object.values(productUrls)[0];
      if (firstUrl) {
        // Remove locale prefix if present
        slug = firstUrl.replace(/^\/[a-z]{2}\/products\//, '/products/');
      }
    }
  }

  // Handle images - Typesense uses image_url and hover_image_url fields
  const imageUrl = String(rawProduct.image_url || '');
  const hoverImageUrl = String(rawProduct.hover_image_url || imageUrl || '');

  // Get stock from variants
  const stock =
    variants?.reduce((total, variant) => {
      return total + (Number(variant.stock) || 0);
    }, 0) || 0;

  // Extract product group products for color variations
  const productGroupProducts = Array.isArray(rawProduct.product_group_products)
    ? (rawProduct.product_group_products as unknown[]).map((pgp: unknown) => {
        const product = pgp as Record<string, unknown>;

        // Extract color information from attributes
        let colorName = '';
        let hexColor = '';

        if (Array.isArray(product.attributes) && product.attributes.length > 0) {
          const colorAttr = (product.attributes as unknown[]).find((attr: unknown) => {
            const attrObj = attr as Record<string, unknown>;
            return attrObj.color !== undefined;
          });

          if (colorAttr && typeof colorAttr === 'object' && 'color' in colorAttr) {
            const color = colorAttr.color as Record<string, unknown>;
            // Get color name
            if (color.title) {
              const titleObj = color.title as Record<string, string> | string;
              colorName = typeof titleObj === 'object' ? titleObj[language] || titleObj.en || '' : String(titleObj);
            }
            // Get hex color
            if (color.meta && typeof color.meta === 'object' && 'hexColor' in color.meta) {
              hexColor = String(color.meta.hexColor);
            }
          }
        }

        // Get product URL for this variant
        let productUrl = '';
        if (product.product_urls && typeof product.product_urls === 'object') {
          const urls = product.product_urls as Record<string, string>;
          const marketKey = Object.keys(urls).find((key) => key.endsWith(`_${countryCode}`));
          if (marketKey) {
            productUrl = urls[marketKey].replace(/^\/[a-z]{2}\/products\//, '/products/');
          } else if (urls.en) {
            productUrl = urls.en.replace(/^\/[a-z]{2}\/products\//, '/products/');
          }
        }

        return {
          id: String(product.id || ''),
          sku: String(product.sku || ''),
          title: product.title || '',
          imageUrl: String(product.image_url || ''),
          productUrl: productUrl,
          color: colorName || String(product.color || ''),
          hexColor: hexColor,
        };
      })
    : undefined;

  return {
    id: String(rawProduct.id || ''),
    sku: sku,
    title: title,
    slug: slug,
    price: price,
    compareAt: compareAt,
    thumbnail: {
      url: imageUrl,
      hoverUrl: hoverImageUrl,
    },
    stock: stock,
    in_stock: rawProduct.in_stock === true,
    availability: String(rawProduct.availability || (rawProduct.in_stock ? 'in_stock' : 'out_of_stock')),
    variant_count: Number(rawProduct.variant_count || variants?.length || 0),
    created_at: String(rawProduct.created_at_timestamp || ''),
    productGroupProducts: productGroupProducts,
    custom_fields: {
      [`price_${currency}`]: [price.toString()],
    },
  };
}

/**
 * Get country code from country name
 */
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    Sweden: 'SE',
    'Sweden-EN': 'SE',
    Norway: 'NO',
    'Norway-EN': 'NO',
    Finland: 'FI',
    'Finland-EN': 'FI',
    Denmark: 'DK',
    'Denmark-EN': 'DK',
    'United Kingdom': 'GB',
    UK: 'GB',
  };
  return countryMap[country] || 'SE';
}

/**
 * Get market code from country code
 */
function getMarketCodeFromCountryCode(countryCode: string): string {
  const codeMap: Record<string, string> = {
    SE: 'se',
    NO: 'no',
    FI: 'fi',
    DK: 'dk',
    GB: 'gb',
  };
  return codeMap[countryCode] || 'se';
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
  const countryCode = getCountryCode(country);

  // Extract collections for the language
  const collections = rawProduct.collections as Record<string, string[]> | undefined;
  const languageCollections = collections?.[language] || collections?.en || [];

  // Extract breadcrumbs for the market
  const breadcrumbs = rawProduct.breadcrumbs as Record<string, Array<Record<string, unknown>>> | undefined;
  const marketKey = Object.keys(breadcrumbs || {}).find((key) => key.endsWith(`_${countryCode}`));
  const marketBreadcrumbs = marketKey && breadcrumbs ? breadcrumbs[marketKey] : [];

  return {
    ...minimal,
    tags: rawProduct.tags || [],
    collections: languageCollections,
    breadcrumbs: marketBreadcrumbs,
    custom_attributes: rawProduct.custom_attributes || [],
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
  // const currency = getCurrencyForCountry(country).toLowerCase(); // Currently unused
  const countryCode = getCountryCode(country);

  // Handle variants - Typesense uses 'variants' not 'productVariants'
  const variants = rawProduct.variants as Array<Record<string, unknown>> | undefined;
  // const firstVariant = variants?.[0]; // Currently unused

  let mainPrice = 0;
  let compareAtPrice = null;
  let salePrice = 0;

  // Process pricing from Typesense prices structure
  const typesensePrices = rawProduct.prices as
    | Record<string, { salePrice?: number; regularPrice?: number; currency?: string }>
    | undefined;
  if (typesensePrices) {
    // Find the price for the current market
    const marketKey = Object.keys(typesensePrices).find((key) => key.endsWith(`_${countryCode}`));

    if (marketKey) {
      const marketPrice = typesensePrices[marketKey];
      mainPrice = marketPrice.salePrice || marketPrice.regularPrice || 0;
      salePrice = mainPrice;

      if (
        marketPrice.regularPrice &&
        marketPrice.salePrice &&
        marketPrice.regularPrice > marketPrice.salePrice &&
        marketPrice.salePrice > 0
      ) {
        compareAtPrice = marketPrice.regularPrice;
      }
    }
  }

  // Handle SKU - Typesense uses 'sku' field directly
  const sku = String(rawProduct.sku || '');

  // Handle title - it's an object with language keys in Typesense
  const titleObj = rawProduct.title as Record<string, string> | string | undefined;
  const title =
    typeof titleObj === 'object' && titleObj !== null
      ? titleObj[language] || titleObj.en || Object.values(titleObj)[0] || 'Unknown Product'
      : String(titleObj || 'Unknown Product');

  // Handle description - also an object with language keys in Typesense
  const descriptionObj = rawProduct.description as Record<string, string> | string | undefined;
  const description =
    typeof descriptionObj === 'object' && descriptionObj !== null
      ? descriptionObj[language] || descriptionObj.en || Object.values(descriptionObj)[0] || ''
      : String(descriptionObj || '');

  // Handle slug - Typesense uses product_urls object
  const productUrls = rawProduct.product_urls as Record<string, string> | undefined;
  const marketCode = getMarketCodeFromCountryCode(countryCode);
  let slug = `/${marketCode}/products/${sku}`;

  if (productUrls) {
    const marketKey = Object.keys(productUrls).find((key) => key.endsWith(`_${countryCode}`));
    if (marketKey && productUrls[marketKey]) {
      const url = productUrls[marketKey];
      slug = url.startsWith('/') ? `/${marketCode}${url}` : `/${marketCode}/${url}`;
    } else {
      const firstUrl = Object.values(productUrls)[0];
      if (firstUrl) {
        slug = firstUrl.startsWith('/') ? `/${marketCode}${firstUrl}` : `/${marketCode}/${firstUrl}`;
      }
    }
  }

  // Handle images - Typesense uses image_url, hover_image_url, and images array
  const imageUrl = String(rawProduct.image_url || '');
  const hoverImageUrl = String(rawProduct.hover_image_url || imageUrl || '');
  const imagesArray = rawProduct.images as string[] | undefined;

  // Build images array for full product
  let images: Array<{ src: string; alt: string }> = [];
  if (imagesArray && Array.isArray(imagesArray)) {
    images = imagesArray.map((url, index) => ({
      src: url,
      alt: `${title} - Image ${index + 1}`,
    }));
  } else if (imageUrl) {
    images = [{ src: imageUrl, alt: title }];
  }

  // Calculate total stock from all variants
  const totalStock =
    variants?.reduce((total, variant) => {
      return total + (Number(variant.stock) || 0);
    }, 0) || 0;

  // Extract custom fields
  const customFields = extractCustomFields(rawProduct, country);

  return {
    id: String(rawProduct.id || ''),
    key: String(rawProduct.id || ''),
    sku: sku,
    title: title,
    display_name: title,
    description: description,
    created_at: String(rawProduct.created_at_timestamp || ''),
    updated_at: String(rawProduct.updated_at_timestamp || ''),
    thumbnail: {
      url: imageUrl,
      hoverUrl: hoverImageUrl,
    },
    images: images,
    status: rawProduct.availability === 'in_stock' ? 'ACTIVE' : 'INACTIVE',
    slug: slug,
    stock: totalStock,
    in_stock: rawProduct.in_stock === true,
    price: mainPrice,
    compareAt: compareAtPrice,
    salePrice: salePrice ? [salePrice.toString()] : [mainPrice.toString()],
    tags: [],
    otherColors: [],
    sizes: [],
    variant_count: Number(rawProduct.variant_count || variants?.length || 0),
    variants: variants?.map((variant) => ({
      id: String(variant.id || ''),
      sku: String(variant.sku || ''),
      stock: Number(variant.stock) || 0,
      in_stock: variant.in_stock === true,
      title: Array.isArray(variant.title) ? variant.title : [],
    })),
    collections: rawProduct.collections as Record<string, string[]> | undefined,
    custom_attributes: rawProduct.custom_attributes || [],
    onlinedate: null,
    coming_soon_publish_date: null,
    new_until_date: null,
    pricing: undefined,
    custom_fields: customFields,
  };
}

/**
 * Extract custom fields from product
 */
function extractCustomFields(rawProduct: Record<string, unknown>, country: string): Record<string, string[]> {
  const customFields: Record<string, string[]> = {};
  const currency = getCurrencyForCountry(country).toLowerCase();

  // Check for Typesense prices structure
  const typesensePrices = rawProduct.prices as
    | Record<string, { salePrice?: number; regularPrice?: number; currency?: string }>
    | undefined;
  if (typesensePrices) {
    // Extract prices for all markets
    Object.entries(typesensePrices).forEach(([, marketPrice]) => {
      if (typeof marketPrice === 'object' && marketPrice !== null) {
        const curr = (marketPrice.currency || '').toLowerCase();
        if (curr) {
          const priceKey = `price_${curr}`;
          const salePriceKey = `sale_price_${curr}`;

          customFields[priceKey] = [(marketPrice.regularPrice || 0).toString()];
          customFields[salePriceKey] = [(marketPrice.salePrice || marketPrice.regularPrice || 0).toString()];

          // Calculate discount
          const discount =
            marketPrice.regularPrice && marketPrice.salePrice && marketPrice.regularPrice > marketPrice.salePrice
              ? Math.round(((marketPrice.regularPrice - marketPrice.salePrice) / marketPrice.regularPrice) * 100)
              : 0;
          customFields[`discount_${curr}`] = [discount.toString()];
        }
      }
    });
  }

  // Ensure we have the current market's currency in custom fields
  if (!customFields[`price_${currency}`]) {
    customFields[`price_${currency}`] = ['0'];
    customFields[`sale_price_${currency}`] = ['0'];
    customFields[`discount_${currency}`] = ['0'];
  }

  return customFields;
}
