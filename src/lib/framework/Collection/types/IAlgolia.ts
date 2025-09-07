export namespace IAlgolia {
  // #region Internals

  export interface DataModel {
    objectID: string;
    title: string;
    description?: string;
    attr_color: string[];
    attr_gender: string[];
    attr_item_category: string[];
    product_sku: string;
    status: string;
    id: number;
    clone_id: number | null;
    external_id: string;
    product_group_identifier: string;
    slug: string;
    full_slug: string;
    media: string[];
    variants: Array<{
      id: number;
      order: number;
      external_id: string;
      sku: string;
      ean: string;
      mpn: string;
      stock: number;
      regular_price: number;
      sale_price: number;
      media: string[];
      updated_at: string;
      created_at: string;
      attr_size: string[];
      attr_size_ch: string[];
      attr_size_uk: string[];
      attr_size_us_men: string[];
      attr_size_us_woman: string[];
      attr_test_123: string[];
    }>;
    brink_id: string;
    elevate_id: string;
    releaseDate: string;
    updated_at: string;
    created_at: string;
    attr_division: string[];
    attr_formatted_color: string[];
    attr_height: number | undefined | null;
    attr_length: number | undefined | null;
    attr_style_details: string[];
    attr_tags: string[];
    attr_test: string[];
    attr_width: number | undefined | null;
    regular_price: number;
    sale_price: number;
    stock: number;
    collection_page_slugs: string[];
    collection_page_titles: string[];
    collection_hierarchy_titles: Record<string, string[]>;
    collection_hierarchy_slugs: Record<string, string[]>;
  }

  export type Attribute = keyof DataModel;
  type FacetAttribute =
    | '*'
    | Extract<
        Attribute,
        | 'attr_color'
        | 'attr_gender'
        | 'attr_item_category'
        | 'product_sku'
        | 'status'
        | 'stock'
        | 'collection_page_slugs'
      >;

  export type BaseAttribute = Extract<keyof DataModel, keyof ItemBase>;
  export type DetailedAttribute = Extract<keyof DataModel, Exclude<keyof IAlgolia.Item, keyof IAlgolia.ItemBase>>;

  export type FacetFilter = `${FacetAttribute}:${string}` | FacetFilter[];

  export interface QueryBody {
    query?: string;
    facetFilters?: FacetFilter[];
    facets?: FacetAttribute[];
    ranking?: string[];

    page?: number;
    hitsPerPage?: number;

    attributesToRetrieve?: Array<Attribute>;
    attributesToHighlight?: Array<Attribute>;
  }

  interface ResponseSuccess<T> {
    hits: T[];

    nbHits: number;
    page: number;
    nbPages: number;
    hitsPerPage: number;
    exhaustiveNbHits: boolean;
    exhaustiveTypo: boolean;
    exhaustive: {
      nbHits: boolean;
      typo: boolean;
    };
    query: string;
    params: string;
    renderingContent: unknown;
    processingTimeMS: number;
    processingTimingsMS: unknown;
    serverTimeMS: number;
  }

  export type GenericResponse<T = unknown> = ResponseSuccess<T>;

  export type SearchBody = Pick<QueryBody, 'query'>;

  export type SearchResponse = GenericResponse<ItemBase>;

  export type ByIdResponse = GenericResponse<Item>;

  // #endregion

  // #region Data interfaces

  export type ItemBase = Pick<
    DataModel,
    | 'objectID'
    | 'product_sku'
    | 'title'
    | 'status'
    | 'media'
    | 'attr_item_category'
    | 'attr_color'
    | 'stock'
    | 'regular_price'
    | 'sale_price'
    | 'slug'
  >;

  export type Item = ItemBase &
    Pick<DataModel, 'description' | 'variants' | 'attr_height' | 'attr_length' | 'attr_width'>;

  export type ItemVariant = DataModel['variants'][0];

  // #endregion
}
