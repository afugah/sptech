import { ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

export class TypesenseCollectionMapper {
  public static ToCollectionResponse(searchResults: {
    found: number;
    page: number;
    request_params?: { per_page?: number };
    hits?: unknown[];
  }): ICollectionResponse.Generic {
    const perPage = searchResults.request_params?.per_page || 24;
    const totalPages = Math.ceil(searchResults.found / perPage);

    return {
      items: searchResults.hits?.map((hit: unknown) => this.mapProductHit(hit)) || [],
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

  private static mapProductHit(hit: unknown): ICollectionItem {
    const document = hit.document as Record<string, unknown>;

    // Safe property access with type guards
    const media = Array.isArray(document.media) ? document.media : [];
    const variants = Array.isArray(document.productVariants) ? document.productVariants : [];
    const firstVariant = variants.length > 0 ? variants[0] : {};
    const firstPrice = Array.isArray((firstVariant as Record<string, unknown>)?.regularPrices)
      ? ((firstVariant as Record<string, unknown>).regularPrices as unknown[])[0]
      : {};

    return {
      id: String(document.id || ''),
      sku: String(document.product_sku || ''),
      key: String(document.id || ''),
      title: String(document.title || ''),
      display_name: String(document.title || ''),
      thumbnail: {
        url: media.length > 0 ? String((media[0] as Record<string, unknown>)?.imageSrc || '') : '',
        hoverUrl: media.length > 1 ? String((media[1] as Record<string, unknown>)?.imageSrc || '') : null,
      },
      color: Array.isArray(document.color) ? document.color.map(String) : [String(document.color || '')],
      description: String(document.description || ''),
      status: (document.status as ProductStatusEnum) || ProductStatusEnum.Active,
      slug: String(document.slug || ''),
      slugSv: String(document.slug || ''), // Using same slug for sv as we're single language now
      stock: Number(firstVariant.stock || 0),
      price: Number(firstPrice?.price || 0),
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
        price: Number(firstPrice?.price || 0),
        currency: String(firstPrice?.currency_code || 'EUR'),
      } as ICollectionItem['pricing'],
      custom_fields: {},
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
