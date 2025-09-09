import { type ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type ITypesense } from '@/src/lib/framework/Product/types/ITypesense';

export class TypesenseProductMapper {
  public static FromTypesense(document: ITypesense.ProductDocument, _language: string): IProduct {
    // Map Typesense document to IProduct
    const firstMedia = document.media?.[0];
    const secondMedia = document.media?.[1];

    return {
      id: String(document.id),
      key: String(document.id), // Using id as key
      title: document.title,
      display_name: document.title, // Using title as display_name
      thumbnail: {
        url: firstMedia?.imageSrc || '',
        hoverUrl: secondMedia?.imageSrc || null,
      },
      color: Array.isArray(document.color) ? document.color : [document.color || ''],
      status: document.status as ProductStatusEnum,
      slug: document.slug,
      slugSv: document.slug, // Using same slug for Swedish variant
      compare_at: null,
      discount: null,

      sku: document.product_sku,
      mpn: document.mpn || '',
      externalId: document.external_id,
      cloneId: null,
      productType: document.type,
      productGroup: document.product_group_identifier || '',
      description: document.description || '',
      images:
        document.media?.map((m) => ({
          src: m.imageSrc,
          alt: m.imageAlt,
        })) || [],
      brinkId: document.external_id,
      variants:
        document.productVariants?.map((variant, index) => ({
          id: String(variant.id),
          title: `Variant ${variant.sku}`,
          sku: variant.sku,
          variant: variant.sku, // Using sku as variant identifier
          ean: variant.ean || '',
          order: index,
          size: undefined, // Would need size extraction from variant data
          price: variant.regularPrices?.[0]
            ? {
                id: String(variant.id),
                basePriceAmount: variant.regularPrices[0].price || 0,
                salePriceAmount: variant.regularPrices[0].price || 0,
                discountAmount: 0,
              }
            : undefined,
          stock: {
            id: String(variant.id),
            quantity: variant.stock || 0,
            isAvailable: (variant.stock || 0) > 0,
            validateStock: true,
            inventories: [],
          },
        })) || [],

      baseColorCode: undefined,
      productColor: Array.isArray(document.color) ? document.color[0] || '' : document.color || '',
      primaryCollection: document.primaryCollection
        ? {
            title: document.primaryCollection.title,
            slug: document.primaryCollection.slug,
          }
        : null,
      productColors: undefined,
      productGroupProducts: undefined,
      isVariantAsImage: false,
      product_flag: [],
      breadcrumbs:
        document.primaryCollection?.breadcrumbs?.map((bc) => ({
          title: bc.title,
          slug: bc.slug,
          full_slug: bc.full_slug,
        })) || [],

      // Optional date fields
      releaseDate: document.release_date,
      releaseDateTimestamp: document.releaseDateTimestamp,
      outOfStockAt: document.out_of_stock_at,
      outOfStockAtTimestamp: document.outOfStockAtTimestamp,
      updatedAt: document.updated_at,
      updatedAtTimestamp: document.updatedAtTimestamp,
      createdAt: document.created_at,
      createdAtTimestamp: document.createdAtTimestamp,

      // Attributes - only include known attribute fields
      attributes: {
        materials: document.material,
      },

      // Additional fields at root level
      categoryCode: document.categoryCode,
      collection: document.collection,
      mainCategory: document.mainCategory,
      material: document.material,
      targetGroup: document.targetGroup,

      // Review score - will be hydrated later
      reviewScore: null,
    };
  }

  public static ToTypesense(product: IProduct, _language: string): ITypesense.ProductDocument {
    // Map IProduct to Typesense document
    return {
      id: product.id.toString(),
      external_id: product.externalId || product.brinkId || '',
      status: product.status,
      product_sku: product.sku,
      mpn: product.mpn,
      product_group_identifier: product.productGroup || '',
      type: product.productType || '',
      title: product.title,
      slug: product.slug,
      fullSlug: product.slug, // Using slug as fullSlug
      description: product.description,

      // Media
      media: product.images?.map((img, index) => ({
        id: index,
        imageSrc: img.src,
        imageAlt: img.alt,
        order: index,
      })),

      // Flattened attributes for search
      categoryCode: product.categoryCode || '',
      collection: product.collection || '',
      color: product.color?.[0] || '',
      mainCategory: product.mainCategory || '',
      material: product.material || '',
      productGroup: product.productGroup || '',
      targetGroup: product.targetGroup || '',

      // Product variants
      productVariants: product.variants?.map((variant) => ({
        id: Number(variant.id),
        sku: variant.sku,
        ean: variant.ean,
        stock: variant.stock?.quantity || 0,
        regularPrices: variant.price
          ? [
              {
                price: variant.price.salePriceAmount,
                currency_code: 'EUR',
                locale: 'en',
              },
            ]
          : [],
      })),

      // Collections
      primaryCollection: product.primaryCollection
        ? {
            id: 1, // Would need proper ID
            title: product.primaryCollection.title,
            slug: product.primaryCollection.slug,
            breadcrumbs:
              product.breadcrumbs?.map((bc, index) => ({
                id: index, // Would need proper ID
                title: bc.title,
                slug: bc.slug,
                full_slug: bc.full_slug,
              })) || [],
          }
        : undefined,

      collectionIds: [], // Would need proper collection IDs
      campaignIds: [], // Would need proper campaign IDs
      activeCampaignIds: [], // Would need active campaign IDs

      // Market data
      marketsExclude: [], // Would need proper market exclusions
      release_date: product.releaseDate || '',
      releaseDateTimestamp: product.releaseDateTimestamp || 0,
      out_of_stock_at: product.outOfStockAt || undefined,
      outOfStockAtTimestamp: product.outOfStockAtTimestamp || undefined,

      // Search optimization fields
      search_keywords: `${product.title} ${product.description} ${product.sku}`,
      facet_category: product.categoryCode ? [product.categoryCode] : [],
      facet_collection: product.collection ? [product.collection] : [],
      facet_color: product.color || [],
      facet_material: product.material ? [product.material] : [],

      // Timestamps
      updated_at: product.updatedAt || '',
      updatedAtTimestamp: product.updatedAtTimestamp || 0,
      created_at: product.createdAt || '',
      createdAtTimestamp: product.createdAtTimestamp || 0,
    };
  }
}
