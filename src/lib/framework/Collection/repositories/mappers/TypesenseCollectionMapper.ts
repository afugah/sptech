import { ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

export class TypesenseCollectionMapper {
  public static ToCollectionResponse(
    searchResults: {
      found: number;
      page: number;
      request_params?: { per_page?: number };
      hits?: unknown[];
    },
    marketCode?: string,
  ): ICollectionResponse.Generic {
    const perPage = searchResults.request_params?.per_page || 24;
    const totalPages = Math.ceil(searchResults.found / perPage);

    return {
      items: searchResults.hits?.map((hit: unknown) => this.mapProductHit(hit, marketCode)) || [],
      pagination: {
        total: {
          items: searchResults.found,
          pages: totalPages,
        },
        page: searchResults.page,
        take: perPage,
        hasMore: searchResults.page < totalPages,
      },
    };
  }

  public static ToFacets(_facetCounts: unknown[]): ICollectionSearch.Facets {
    // Return empty facets for now - would need proper implementation
    return [];
  }

  private static mapProductHit(hit: unknown, marketCode?: string): ICollectionItem {
    const hitRecord = hit as Record<string, unknown>;
    const document = hitRecord.document as Record<string, unknown>;

    // Generate marketKey for accessing market-specific data
    const marketKey = marketCode ? `europe_${marketCode.toUpperCase()}` : undefined;

    // Safe property access with type guards
    const media = Array.isArray(document.media) ? document.media : [];
    const images = Array.isArray(document.images) ? document.images : [];
    const variants = Array.isArray(document.variants)
      ? document.variants
      : Array.isArray(document.productVariants)
        ? document.productVariants
        : [];
    const firstVariant = variants.length > 0 ? variants[0] : {};
    const firstPrice = Array.isArray((firstVariant as Record<string, unknown>)?.regularPrices)
      ? ((firstVariant as Record<string, unknown>).regularPrices as unknown[])[0]
      : {};

    // Get image URLs from new structure or fallback to media
    const imageUrl = document.image_url
      ? String(document.image_url)
      : images.length > 0
        ? String(images[0])
        : media.length > 0
          ? String((media[0] as Record<string, unknown>)?.imageSrc || '')
          : '';
    const hoverImageUrl = document.hover_image_url
      ? String(document.hover_image_url)
      : images.length > 1
        ? String(images[1])
        : media.length > 1
          ? String((media[1] as Record<string, unknown>)?.imageSrc || '')
          : null;

    return {
      id: String(document.id || ''),
      sku: String(document.sku || document.product_sku || ''),
      key: String(document.id || ''),
      title: String(document.title || ''),
      display_name: String(document.title || ''),
      thumbnail: {
        url: imageUrl,
        hoverUrl: hoverImageUrl,
      },
      color: Array.isArray(document.color) ? document.color.map(String) : [String(document.color || '')],
      description: String(document.description || ''),
      status: (document.status as ProductStatusEnum) || ProductStatusEnum.Active,
      // Use market-specific product URL if available
      slug: (() => {
        if (marketKey && document.product_urls && typeof document.product_urls === 'object') {
          const urls = document.product_urls as Record<string, unknown>;
          if (urls[marketKey]) {
            const url = String(urls[marketKey]);
            // Remove locale prefix if present (e.g., /se/products/... -> /products/...)
            // This regex matches /{locale}/products/ and captures just /products/...
            const cleanUrl = url.replace(/^\/[a-z]{2}\/products\//, '/products/');
            return cleanUrl;
          }
        }
        // Fallback: Ensure slug has /products/ prefix
        const baseSlug = String(document.slug || '');
        return baseSlug.startsWith('/products/') ? baseSlug : `/products/${baseSlug}`;
      })(),
      slugSv: String(document.slug || ''), // Using same slug for sv as we're single language now
      stock: Number((firstVariant as Record<string, unknown>)?.stock || 0),
      price: Number((firstPrice as Record<string, unknown>)?.price || 0),
      tags: Array.isArray(document.tags) ? document.tags.map(String) : [],
      salePrice: null, // Would need discount calculation
      compare_at: null, // Would need original price
      discount: null, // Would need discount calculation
      otherColors: [],
      sizes: [], // Would need size variant mapping
      onlinedate: String(document.created_at || ''),
      coming_soon_publish_date: null,
      new_until_date: null,
      created_at: new Date(String(document.created_at || Date.now())),
      pricing: {
        // Basic pricing structure - would need full Findify structure
        price: Number((firstPrice as Record<string, unknown>)?.price || 0),
        currency: String((firstPrice as Record<string, unknown>)?.currency_code || 'EUR'),
      } as unknown as ICollectionItem['pricing'],
      custom_fields: {},
      // Add product group products for color selection
      productGroupProducts: Array.isArray(document.product_group_products)
        ? (document.product_group_products as unknown[]).map((pgp: unknown) => {
            const product = pgp as Record<string, unknown>;
            // Get product URL - try market-specific key first, then fallback to 'en'
            let productUrl = '';
            if (product.product_urls && typeof product.product_urls === 'object') {
              const urls = product.product_urls as Record<string, unknown>;
              // Try market-specific key first (e.g., europe_SE)
              if (marketKey && urls[marketKey]) {
                const url = String(urls[marketKey]);
                // Remove locale prefix if present (e.g., /se/products/... -> /products/...)
                productUrl = url.replace(/^\/[a-z]{2}\/products\//, '/products/');
              }
              // Fallback to 'en' key if market-specific not found
              else if (urls['en']) {
                const url = String(urls['en']);
                // Remove locale prefix if present
                productUrl = url.replace(/^\/[a-z]{2}\/products\//, '/products/');
              }
            }

            // Extract color information from attributes
            let colorName = '';
            let hexColor = '';

            if (Array.isArray(product.attributes) && product.attributes.length > 0) {
              const colorAttr = product.attributes.find((attr: unknown) => {
                return typeof attr === 'object' && attr !== null && 'color' in attr;
              });
              if (colorAttr && typeof colorAttr === 'object' && 'color' in colorAttr && colorAttr.color) {
                // Get color name
                if (colorAttr.color.title) {
                  colorName =
                    typeof colorAttr.color.title === 'object'
                      ? colorAttr.color.title.en || ''
                      : String(colorAttr.color.title);
                }
                // Get hex color
                if (colorAttr.color.meta && colorAttr.color.meta.hexColor) {
                  hexColor = colorAttr.color.meta.hexColor;
                }
              }
            }

            return {
              id: product.id || '',
              sku: product.sku || '',
              title: product.title || '',
              imageUrl: product.image_url || '',
              productUrl: productUrl,
              color: colorName || product.color || '',
              hexColor: hexColor,
            };
          })
        : undefined,
    };
  }

  public static ToTypesenseSearchParams(
    query?: string,
    filters?: ICollectionSearch.Filters,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {
      q: query || '*',
      query_by: 'title,description,product_sku,search_keywords',
    };

    // Add filters
    if (filters) {
      const filterConditions: string[] = [];

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filterConditions.push(`${key}:[${value.join(',')}]`);
          }
        } else if (value !== undefined && value !== null) {
          filterConditions.push(`${key}:${value}`);
        }
      });

      if (filterConditions.length > 0) {
        params.filter_by = filterConditions.join(' && ');
      }
    }

    // Add sorting
    if (sort && sort.length > 0) {
      params.sort_by = sort.map((s) => `${s.field}:${s.order}`).join(',');
    }

    // Add pagination
    if (pagination) {
      params.page = pagination.page || 1;
      params.per_page = pagination.take || 24;
    }

    // Default faceting
    params.facet_by = 'facet_category,facet_collection,facet_color,facet_material';
    params.max_facet_values = 100;

    return params;
  }
}
