import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

export namespace IFindify {
  export interface Item {
    id: string;
    title: string;
    availability: boolean;
    price: Array<number>;
    pricing: PricingStructure;
    compare_at: number | null;
    quantity: number;
    image_url: string;
    thumbnail_url: string;
    product_url: string;
    color: string[];
    color_variants: number;
    selected_variant_id: string;
    item_group_id: string;
    size: string[];
    created_at: number;
    updated_at: number;
    tags: string[];
    discount: number | null;
    custom_fields: {
      product_title: string;
      onlinedate: string[] | null;
      comingsoonpublishdate: string[] | null;
      newuntildate: string[] | null;
      sale_price?: number;
      product_image_hover_url: string[];
      slug: string;
      full_slug: string;
      display_name: string;
      productflags: string[];
      othercolors: string[];
      'price|web_se': string[];
      'sale_price|web_se': string[];
      'discount|web_se': string[];
      'price|web_fi': string[];
      'sale_price|web_fi': string[];
      'discount|web_fi': string[];
      'price|web_no': string[];
      'sale_price|web_no': string[];
      'discount|web_no': string[];
      'price|member_se': string[];
      'sale_price|member_se': string[];
      'discount|member_se': string[];
      'price|member_fi': string[];
      'sale_price|member_fi': string[];
      'discount|member_fi': string[];
      'price|member_no': string[];
      'sale_price|member_no': string[];
      'discount|member_no': string[];
      'price|member-silver_se': string[];
      'sale_price|member-silver_se': string[];
      'discount|member-silver_se': string[];
      'price|member-silver_fi': string[];
      'sale_price|member-silver_fi': string[];
      'discount|member-silver_fi': string[];
      'price|member-silver_no': string[];
      'sale_price|member-silver_no': string[];
      'discount|member-silver_no': string[];
      'price|member-gold_se': string[];
      'sale_price|member-gold_se': string[];
      'discount|member-gold_se': string[];
      'price|member-gold_fi': string[];
      'sale_price|member-gold_fi': string[];
      'discount|member-gold_fi': string[];
      'price|member-gold_no': string[];
      'sale_price|member-gold_no': string[];
      'discount|member-gold_no': string[];
    };

    variants: {
      color: string[];
      size: string[];
      custom_fields: {
        full_slug: string;
        slug: string;
      };
    };

    reviews: unknown;
    stickers: {
      'in-stock': boolean;
      'out-of-stock': boolean;
    };
  }
  export interface Pricing {
    price: number | null;
    sale_price: number | null;
    discount: number | null;
  }
  export type Locale = 'SE' | 'FI' | 'NO';
  export type MembershipLevel = 'WEB' | 'MEMBER' | 'MEMBER-SILVER' | 'MEMBER-GOLD';
  export type PricingStructure = Record<MembershipLevel, Record<Locale, Pricing>>;

  export interface User {
    uid: string;
    sid: string;
    email?: string;
    ip?: string;
    ua?: string;
    lang?: string[];
  }

  export interface Sort {
    field: string;
    order: 'asc' | 'desc';
  }

  export type ItemFilters =
    | 'item_group_id'
    | 'brand'
    | 'color'
    | 'size'
    | 'price'
    | 'quantity'
    | 'availability'
    | 'category1';

  interface FilterBase {
    name: ItemFilters;
    type: string;
  }

  interface CommonFilter extends FilterBase {
    type: 'text' | 'boolean' | 'category';
    values: Array<Record<'value', number | string>>;
  }

  interface RangeFilter extends FilterBase {
    type: 'range';
    values: Array<{
      from?: number;
      to?: number;
    }>;
  }

  interface CommonFilterAdvanced extends CommonFilter {
    values: {
      value: string;
      count: number;
      name: string;
    }[];
  }
  export interface FiltersProps {
    range: RangeFilter;
    common: CommonFilterAdvanced[];
  }
  export type Filter = CommonFilter | RangeFilter;

  export interface QueryBody {
    /**
     * DateTime timestamp
     */
    t_client?: number;
    user?: User;

    q?: string;
    sort?: Sort[];
    filters: Filter[];

    offset?: number;
    /**
     * @description Default = 24; Max = 120
     */
    limit?: number;
  }

  export interface FeaturedQueryBody extends Pick<QueryBody, 'user' | 't_client' | 'offset' | 'limit'> {
    item_id?: string;
    item_ids?: string[];
  }

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

  export interface SuccessResponse {
    meta: {
      query_type: string;
      q: string;
      filters: Filter[];
      sort: Sort[];
      offset: number;
      limit: number;
      total: number;
      rid: string;
    };

    // TODO: Update types
    facets: ICollectionSearch.Facets;

    redirect?: {
      name: string;
      url: string;
    };

    banner: {
      products?: {
        imageUrl: string;
        name: string;
        targetUrl: string;
      };
    };

    items: Item[];
  }

  export interface ErrorResponse {
    error: {
      message: string;
    };
  }

  export type GenericResponse = SuccessResponse | ErrorResponse;
}
