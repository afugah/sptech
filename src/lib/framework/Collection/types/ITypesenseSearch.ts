export namespace ITypesenseSearch {
  // Search parameters for collection searches
  export interface SearchParams {
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
    prioritize_exact_match?: boolean;
    enable_overrides?: boolean;
    search_cutoff_ms?: number;
  }

  // Filter structure matching existing ICollectionSearch.Filter
  export interface Filter {
    [key: string]: string[] | string | number[] | number | boolean[] | boolean;
  }

  export interface Filters {
    [key: string]: Filter;
  }

  // Sort structure matching existing ICollectionSearch.Sort
  export interface Sort {
    field: string;
    order: 'asc' | 'desc';
  }

  // Pagination structure matching existing ICollectionSearch.Pagination
  export interface Pagination {
    offset?: number;
    limit?: number;
    page?: number;
    per_page?: number;
  }

  // Facet structure for search results
  export interface FacetCount {
    count: number;
    highlighted: string;
    value: string;
  }

  export interface FacetStats {
    avg?: number;
    max?: number;
    min?: number;
    sum?: number;
    total_values?: number;
  }

  export interface Facet {
    field_name: string;
    counts: FacetCount[];
    stats?: FacetStats;
  }

  export interface Facets {
    [key: string]: Facet;
  }

  // Search hit structure
  export interface Hit<T = unknown> {
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
  }

  // Search response structure
  export interface SearchResponse<T = unknown> {
    facet_counts?: Facet[];
    found: number;
    found_docs?: number;
    out_of: number;
    page: number;
    request_params: SearchParams;
    search_cutoff: boolean;
    search_time_ms: number;
    hits: Hit<T>[];
    grouped_hits?: Array<{
      group_key: string[];
      hits: Hit<T>[];
    }>;
  }

  // Autocomplete suggestion structure
  export interface AutocompleteSuggestion {
    suggestion: string;
    type: 'product' | 'collection' | 'category';
    count?: number;
  }

  export interface AutocompleteResponse {
    suggestions: AutocompleteSuggestion[];
    search_time_ms: number;
  }

  export type GenericResponse<T = unknown> = SearchResponse<T>;
}
