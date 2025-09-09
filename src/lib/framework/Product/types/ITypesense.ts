export namespace ITypesense {
  export interface QueryParams {
    q?: string;
    query_by?: string;
    filter_by?: string;
    sort_by?: string;
    facet_by?: string;
    max_facet_values?: number;
    page?: number;
    per_page?: number;
    group_by?: string;
    group_limit?: number;
    include_fields?: string;
    exclude_fields?: string;
    highlight_fields?: string;
    snippet_threshold?: number;
    num_typos?: number;
    prefix?: boolean;
    infix?: boolean;
    min_len_1typo?: number;
    min_len_2typo?: number;
    split_join_tokens?: string;
    exhaustive_search?: boolean;
    drop_tokens_threshold?: number;
    typo_tokens_threshold?: number;
    pinned_hits?: string;
    hidden_hits?: string;
    prioritize_exact_match?: boolean;
    enable_overrides?: boolean;
    override_tags?: string;
    search_cutoff_ms?: number;
    limit_multi_searches?: number;
  }

  export interface SearchResponse<T = unknown> {
    facet_counts?: Array<{
      field_name: string;
      counts: Array<{
        count: number;
        highlighted: string;
        value: string;
      }>;
      stats?: {
        avg?: number;
        max?: number;
        min?: number;
        sum?: number;
        total_values?: number;
      };
    }>;
    found: number;
    found_docs?: number;
    out_of: number;
    page: number;
    request_params: QueryParams;
    search_cutoff: boolean;
    search_time_ms: number;
    hits: Array<{
      document: T;
      highlight?: Record<string, unknown>;
      highlights?: Array<{
        field: string;
        snippet?: string;
        snippets?: string[];
        value?: string;
        values?: string[];
        matched_tokens: string[];
      }>;
      text_match: number;
      text_match_info?: {
        best_field_score: string;
        best_field_weight: number;
        fields_matched: number;
        num_tokens_dropped: number;
        score: string;
        tokens_matched: number;
        typo_prefix_score: number;
      };
    }>;
    grouped_hits?: Array<{
      group_key: string[];
      hits: Array<{
        document: T;
        highlight?: Record<string, unknown>;
        highlights?: Array<{
          field: string;
          snippet?: string;
          snippets?: string[];
          value?: string;
          values?: string[];
          matched_tokens: string[];
        }>;
        text_match: number;
      }>;
    }>;
  }

  // Product document structure for Typesense
  export interface ProductDocument {
    id: string;
    external_id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'SCHEDULED' | 'PAUSED';
    product_sku: string;
    mpn?: string;
    product_group_identifier?: string;
    type: string;
    title: string;
    slug: string;
    fullSlug: string;
    description?: string;
    media?: Array<{
      id: number;
      imageSrc: string;
      imageAlt: string;
      order: number;
    }>;

    // Attributes flattened for search
    categoryCode?: string;
    collection?: string;
    color?: string;
    mainCategory?: string;
    material?: string;
    productGroup?: string;
    targetGroup?: string;

    // Product variants for pricing/stock (from Brink)
    productVariants?: Array<{
      id: number;
      sku: string;
      ean?: string;
      stock: number;
      regularPrices: Array<{
        price: number;
        currency_code: string;
        locale: string;
      }>;
    }>;

    // Collections and campaigns
    primaryCollection?: {
      id: number;
      title: string;
      slug: string;
      breadcrumbs: Array<{
        id: number;
        title: string;
        slug: string;
        full_slug: string;
      }>;
    };

    collectionIds?: number[];
    campaignIds?: number[];
    activeCampaignIds?: number[];

    // Market and availability
    marketsExclude?: string[];
    release_date?: string;
    releaseDateTimestamp?: number;
    out_of_stock_at?: string;
    outOfStockAtTimestamp?: number;

    // Search-optimized fields
    search_keywords?: string;
    facet_category?: string[];
    facet_collection?: string[];
    facet_color?: string[];
    facet_material?: string[];
    facet_price?: number;

    // Timestamps
    updated_at: string;
    updatedAtTimestamp: number;
    created_at: string;
    createdAtTimestamp: number;
  }

  // Collection document structure
  export interface CollectionDocument {
    id: string;
    title: string;
    slug: string;
    fullSlug: string;
    description?: string;
    type: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'SCHEDULED' | 'PAUSED';

    // Hierarchy
    parent_id?: string;
    breadcrumbs?: Array<{
      id: string;
      title: string;
      slug: string;
      full_slug: string;
    }>;

    // Product associations
    product_count: number;
    product_ids?: string[];

    // Search optimization
    search_keywords?: string;
    facet_category?: string[];

    // Timestamps
    updated_at: string;
    updatedAtTimestamp: number;
    created_at: string;
    createdAtTimestamp: number;
  }

  export type GenericResponse<T = ProductDocument> = SearchResponse<T>;
}
