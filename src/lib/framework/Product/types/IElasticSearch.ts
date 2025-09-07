export namespace IElasticSearch {
  export interface QueryBody {
    params: {
      fullSlug?: string;
      id?: string;
    };
  }

  interface Media {
    id: number;
    imageSrc: string;
    imageAlt: string;
    order: number;
  }

  export interface ItemAttribute<
    TValue,
    TType extends
      | 'DATE_PICKER'
      | 'TEXTINPUT'
      | 'TEXT_INPUT'
      | 'TEXTAREA'
      | 'TOGGLE'
      | 'NUMBER'
      | 'AttributeValue'
      | 'RICH_EDITOR'
      | 'SELECT',
  > {
    value: TValue;
    type: TType;
    isTranslatable: boolean;
    isMultiValue: boolean;
    meta: [{ type: string; value: string }];
    slug: Record<string, string>;
    external_id: string;
  }

  interface ItemAttributes {
    additionalInfo?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_width?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    pl_Carat?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    categoryCode?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_Certificate?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    coll?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    collection?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    color?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    content_blocks?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    pl_Decor?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    pl_Diamonds?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    engravingInfo?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    gruppering?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    pl_Height?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    engraving_comment?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    label?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_Length?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    mainCategory?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    material?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_Material?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    measurementInfo?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    metaDescription?: ItemAttribute<Record<string, string>, 'TEXTAREA'>;
    meta_keywords?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    metaTitle?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    pdp_template?: ItemAttribute<string, 'TEXT_INPUT'>;
    product_extra_info?: ItemAttribute<Record<string, string>, 'RICH_EDITOR'>;
    product_flag?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    productGroup?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    productRanges?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    pl_Pearls?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    quote?: ItemAttribute<Record<string, string>, 'TEXTAREA'>;
    quoteBy?: ItemAttribute<string, 'TEXT_INPUT'>;
    repair_policy?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    reparationsinfo?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    spare_parts?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    resizeInfo?: ItemAttribute<Record<string, string>, 'TEXTAREA'>;
    cooperation?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    sitoo_cooperation?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    sanity_category?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    season?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    size_guide?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_rails?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    pl_Grinding?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    pl_Stone?: ItemAttribute<Record<string, string>, 'TEXT_INPUT'>;
    stilanpassningar?: ItemAttribute<string, 'TEXT_INPUT'>;
    stocktype?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    size_change?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    targetGroup?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    pl_Manufacturing?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    pl_Volume?: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'>;
    you_might_also_like?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
  }

  export interface ProductVariant {
    id: number;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'SCHEDULED' | 'PAUSED';
    title: Record<string, string>;
    order: number;
    external_id: string;
    sku: string;
    ean: string;
    mpn: string;
    stock: number;
    warehouseStocks: Record<string, number | null>;
    regularPrices: {
      price: number;
      currency_code: string;
      locale: string;
    }[];
    attributes: {
      availability_date_cl?: ItemAttribute<string, 'TEXT_INPUT'>;
      giftcard_value?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      leadTime?: ItemAttribute<string, 'TEXT_INPUT'>;
      no2?: ItemAttribute<string, 'TEXT_INPUT'>;
      purchaseCost?: ItemAttribute<string, 'NUMBER'>;
      sizeDescription?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      stocktype?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      stockTypeVariant?: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    };
    attributeValueIds: [];
    updated_at: string;
    created_at: string;
  }

  interface ProductGroup {
    id: number;
    title: Record<string, string>;
    group_id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'SCHEDULED' | 'PAUSED';
    external_id: string;
    attributes: {
      Materials: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      COUNTRYOFORIGIN: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      AGECATEGORY: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      FIT: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      FRONT: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      NECKLINE: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      POCKETS: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      WAIST: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      QUALITY: ItemAttribute<Record<string, string> | null, 'AttributeValue'>;
      CAREINSTRUCTIONS: ItemAttribute<Record<string, string>, 'AttributeValue'>;

      SLEEVELENGTH: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      PACKAGESIZE: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      PATTERN: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      PRODUCTTYPE: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SCENT: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SEASON: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SEASONCODE: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SIZE: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SLEEVEDETAILS: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SLEEVEEND: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      SOURCECOUNTRY: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      THEME: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      CUT: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      FLAVOR: ItemAttribute<Record<string, string>, 'AttributeValue'>;

      material_back: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_body: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_decoration: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & {
        meta: { percent: number }[];
      };
      material_fill: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_front: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_lining: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_main: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_other: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_shell: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_sleeves: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & {
        meta: { percent: number }[];
      };
      material_upper: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };
      material_bottom: ItemAttribute<Array<Record<string, string>>, 'AttributeValue'> & { meta: { percent: number }[] };

      GARMENTLENGTH: ItemAttribute<string, 'TEXTAREA'>;
      INSIDELEGLENGTH: ItemAttribute<string, 'TEXTAREA'>;
      CHESTWIDTH: ItemAttribute<string, 'TEXTAREA'>;
      WAISTMEASURMENT: ItemAttribute<string, 'TEXTAREA'>;
      'WEIGHT(GSM)': ItemAttribute<string, 'TEXTAREA'>;
      'PRINT/PATTERN': ItemAttribute<string, 'TEXTAREA'>;

      HOMEACCLENGTH: ItemAttribute<string, 'TEXTAREA'>;
      HOMEACCWIDTH: ItemAttribute<string, 'TEXTAREA'>;
      HOMEACCDIAMETER: ItemAttribute<string, 'TEXTAREA'>;
      HOMEACCHEIGHT: ItemAttribute<string, 'TEXTAREA'>;

      ITEMCATEGORY: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      ITEMCLASS: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      ITEMGROUP: ItemAttribute<Record<string, string>, 'AttributeValue'>;
      ITEMTYPE: ItemAttribute<Record<string, string>, 'AttributeValue'>;
    };
    attributeValueIds: [];
    updated_at: string;
    created_at: string;
  }

  interface PrimaryCollection {
    id: number;
    title: Record<string, string>;
    slug: Record<string, string>;
    breadcrumbs: {
      id: number;
      title: Record<string, string>;
      slug: Record<string, string>;
      full_slug: Record<string, string>;
    }[];
  }

  type ProductGroupProduct = Pick<
    Item,
    'id' | 'title' | 'product_sku' | 'slug' | 'fullSlug' | 'status' | 'attributes'
  > & {
    image: string;
  };

  export interface Item {
    id: number;
    clone_id: number | null;
    external_id: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'SCHEDULED' | 'PAUSED';
    product_sku: string;
    mpn: string;
    product_group_identifier: string;
    type: string;
    title: Record<string, string>;
    slug: Record<string, string>;
    fullSlug: Record<string, string>;
    description: Record<string, string>;
    media: Media[];
    attributes: ItemAttributes;
    attributeValueIds: number[];
    primaryCollection?: PrimaryCollection;
    bundles: null;
    productListIds: number[];
    collectionIds: number[];
    campaignIds: number[];
    activeCampaignIds: null;
    productVariants: ProductVariant[];
    productGroup: ProductGroup | null;
    productGroupProducts: ProductGroupProduct[];
    brink_id: string;
    elevate_id: string | null;
    warehouseStocks: Record<string, number>;
    marketsExclude: string[];
    release_date: string;
    releaseDateTimestamp: number;
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

  export interface HitItem<T> {
    _index: string;
    _id: string;
    _score: number;
    _ignored: string[];
    _source: T;
  }

  export interface SuccessResponse {
    took: number;
    timed_out: boolean;

    _shards: {
      total: number;
      successful: number;
      skipped: number;
      failed: number;
    };

    hits: {
      total: number;
      max_score: number;
      hits: HitItem<Item>[];
    };
  }

  export interface IWarehouseSource {
    id: number;
    externalId: string;
    title: string;
    city: string;
    streetAddress: string;
    postalCode: string;
    country: string;
    description: string;
    attributes: [];
    updated_at: string;
    created_at: string;
  }

  export interface IWarehouseInfo {
    _index: string;
    _id: string;
    _score: number;
    _source: IWarehouseSource;
  }

  export interface WareHousesSuccessResponse {
    took: number;
    timed_out: boolean;

    _shards: {
      total: number;
      successful: number;
      skipped: number;
      failed: number;
    };

    hits: {
      total: number;
      max_score: number;
      hits: IWarehouseInfo[];
    };
  }

  export type GenericResponse = SuccessResponse;
}
