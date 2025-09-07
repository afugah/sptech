export namespace ICollectionSearch {
  export interface Filter {
    brand?: Array<string>;
    color?: Array<string>;
    gender?: Array<string>;
    material?: Array<string>;
    categorycode?: Array<string>;
    additionalinfo?: Array<string>;
    size?: Array<string>;
    category?: Array<string>;
    price?: Range;
  }

  export interface Range {
    min?: number;
    max?: number;
  }

  export interface Filters {
    query?: string;
    slug?: string;

    includeInactive?: boolean;

    filter?: Filter;
  }
  export interface Sort {
    field: string;
    order: 'asc' | 'desc';
  }
  export interface Pagination {
    page?: number;
    take?: number;
  }

  /* #region  // NOTE: It's temporary. Need to check the data type on Algolia as well */

  export interface FacetValue {
    name: string;
    value: string;
    count: number;
    children?: FacetValue[] | null;
    selected: boolean;
    has_children: boolean;
    from?: number | null;
    to?: number | null;
  }

  interface FacetBase {
    name: string;
    type: string;
    values: FacetValue[];
    sort_type: string;
  }

  interface Facet extends FacetBase {
    type: 'category' | 'text';
  }

  export interface FacetRange extends FacetBase {
    name: 'price';
    type: 'range';
    min: number;
    max: number;
  }

  export type Facets = Array<Facet | FacetRange>;

  /* #endregion */
}
