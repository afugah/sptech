// Product types based on Elastic Search payload

export interface LocalizedValue {
  en: string;
  sv: string;
  fi: string;
  da?: string;
  de?: string;
  nb?: string;
  nl?: string;
}

export interface AttributeValue {
  type: string;
  isTranslateable: boolean;
  isMultiValue: boolean;
  value: LocalizedValue | LocalizedValue[] | null;
  external_id?: string | string[];
  slug?: LocalizedValue | LocalizedValue[];
  meta?: unknown[];
}

export interface Price {
  price: number;
  currency_code: string;
  locale?: string;
}

export interface ProductMedia {
  id: number;
  imageSrc: string;
  imageAlt: string;
  order: number;
}

export interface ProductVariant {
  id: number;
  status: 'ACTIVE' | 'INACTIVE';
  title: LocalizedValue;
  order: number;
  external_id: string;
  sku: string;
  ean: string;
  mpn: string;
  stock: number;
  warehouseStocks: Record<string, number | null>;
  regularPrices: Price[];
  priceListPrices: Price[];
  attributes: Record<string, AttributeValue>;
  attributeValueIds: number[];
  updated_at: string;
  created_at: string;
}

export interface ProductGroupProduct {
  id: number;
  title: LocalizedValue;
  image?: string;
  product_sku: string;
  slug: LocalizedValue;
  fullSlug: Partial<LocalizedValue>;
  status: 'ACTIVE' | 'INACTIVE';
  stockSum: number;
  attributes: Record<string, unknown>[];
  // Enhanced fields for material selection
  material?: {
    value: LocalizedValue;
    external_id: string;
    display_name?: LocalizedValue;
  };
  price?: {
    regular: Price[];
  };
  availability?: {
    inStock: boolean;
    stockSum: number;
  };
}

export interface Collection {
  id: number;
  title: LocalizedValue;
  slug: Partial<LocalizedValue>;
  breadcrumbs: Array<{
    id: number;
    title: LocalizedValue;
    slug: LocalizedValue;
    full_slug: Partial<LocalizedValue>;
  }>;
}

export interface ProductGroup {
  id: number;
  title: LocalizedValue;
  group_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  external_id: string;
  attributes: unknown[];
  attributeValueIds: number[];
  updated_at: string;
  created_at: string;
}

export interface ElasticProduct {
  id: number;
  clone_id: number | null;
  external_id: string;
  status: 'ACTIVE' | 'INACTIVE';
  product_sku: string;
  mpn: string;
  product_group_identifier: string;
  type: 'REGULAR';
  title: LocalizedValue;
  slug: LocalizedValue;
  fullSlug: Partial<LocalizedValue>;
  description: LocalizedValue;
  media: ProductMedia[];
  attributes: Record<string, AttributeValue>;
  attributeValueIds: number[];
  primaryCollection: Collection;
  bundles: unknown | null;
  productListIds: number[];
  collectionIds: number[];
  campaignIds: number[];
  activeCampaignIds: number[] | null;
  productVariants: ProductVariant[];
  productGroup: ProductGroup;
  productGroupProducts: ProductGroupProduct[];
  brink_id: string;
  elevate_id: string | null;
  warehouseStocks: Record<string, number>;
  marketsExclude: unknown[];
  release_date: string | null;
  releaseDateTimestamp: number | null;
  out_of_stock_at: string | null;
  outOfStockAtTimestamp: number | null;
  updated_at: string;
  updatedAtTimestamp: number;
  created_at: string;
  createdAtTimestamp: number;
  viewData: {
    marketsDiscounts: Record<string, unknown>;
  };
}

export interface ElasticResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: ElasticProduct;
    }>;
  };
}

// Material selector specific types
export interface MaterialOption {
  id: string;
  displayName: LocalizedValue;
  product: ProductGroupProduct;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface MaterialSelectorData {
  currentMaterial: string;
  availableMaterials: MaterialOption[];
  locale: keyof LocalizedValue;
}
