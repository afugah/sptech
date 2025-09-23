import { type ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type IProductColorVariant } from '@/src/lib/framework/Product/domain/entities/IProductColorVariant';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IReviewScore } from '@/src/lib/framework/Reviews/domain/entities/IReviewScore';
import { type ProductGroupProduct } from '@/src/types/product';

// interface IProductCategory {
//   id: string | undefined;
//   title: string;
//   slug: string;
// }

// interface IProductCategories {
//   itemCategory: IProductCategory;
//   itemClass: IProductCategory;
//   itemGroup: IProductCategory;
//   itemType: IProductCategory;
// }

export interface IProduct {
  id: string;
  key: string;
  title: string;
  display_name: string;
  thumbnail: {
    url: string;
    hoverUrl: string | null | undefined;
  };
  color: string[];
  status: ProductStatusEnum;
  slug: string;
  slugSv?: string;
  compare_at: number | null;
  discount: number | null;

  sku: string;
  mpn: string;
  externalId?: string;
  cloneId?: number | null;
  productType?: string;
  productGroup: string;
  description: string;
  images: { src: string; alt: string }[];
  brinkId: string;
  variants: IProductVariant[];

  baseColorCode: { title: string; value?: string } | undefined;
  productColor: string;
  primaryCollection: {
    title: string;
    slug: string;
  } | null;
  productColors?: IProductColorVariant[];
  productGroupProducts?: ProductGroupProduct[];
  isVariantAsImage: boolean;
  product_flag: Array<{
    title: string;
    textColor: string;
    backgroundColor: string;
  }>;
  breadcrumbs: Array<{
    title: string;
    slug: string;
    full_slug: string;
  }>;
  // categories: IProductCategories;
  comingSoonPublishDate?: string;
  newUntilDate?: string;
  quote?: string;
  quoteBy?: string;
  sanity_category?: string;
  season?: string;
  stockType?: string;
  targetGroup?: string;
  material?: string;
  collection?: string;
  label?: string;
  mainCategory?: string;
  categoryCode?: string;

  // Date fields
  releaseDate?: string;
  releaseDateTimestamp?: number;
  outOfStockAt?: string | null;
  outOfStockAtTimestamp?: number | null;
  updatedAt?: string;
  updatedAtTimestamp?: number;
  createdAt?: string;
  createdAtTimestamp?: number;

  attributes: {
    materials?: string;
    countryOfOrigin?: string;
    ageCategory?: string;
    fit?: string;
    front?: string;
    neckline?: string;
    pockets?: string;
    waist?: string;
    quality?: string;
    diameter?: number;
    cordLength?: number;
    width?: number;
    height?: number;
    length?: number;
    garmentLength?: Record<string, string>;
    chestWidth?: Record<string, string>;
    insideLegLength?: Record<string, string>;
    waistMeasurement?: Record<string, string>;
    sleeveLength?: Record<string, string>;
    careInstructions?: string;
    packageSize?: string;
    pattern?: string;
    productType?: string;
    printPattern?: string;
    scent?: string;
    season?: string;
    seasonCode?: string;
    size?: string;
    sleeveDetails?: string;
    sleeveEnd?: string;
    sourceCountry?: string;
    theme?: string;
    weightGsm?: string;
    cut?: string;
    flavor?: string;
    material_back?: string;
    material_body?: string;
    material_decoration?: string;
    material_fill?: string;
    material_front?: string;
    material_lining?: string;
    material_main?: string;
    material_other?: string;
    material_shell?: string;
    material_sleeves?: string;
    material_upper?: string;
    material_bottom?: string;
    model_length?: string;
    model_size?: string;
    homeAccLength?: string;
    homeAccWidth?: string;
    homeAccDiameter?: string;
    homeAccHeight?: string;
    // Typesense-specific properties
    material_typesense?: string;
    width_typesense?: string;
    height_typesense?: string;
    length_typesense?: string;
    weight_typesense?: string;
    // USP properties
    usp1?: string;
    usp2?: string;
    usp3?: string;
  };

  // Will be hydrated from ReviewService
  reviewScore: IReviewScore | null;
}
