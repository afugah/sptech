import { type ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type ITypesense } from '@/src/lib/framework/Product/types/ITypesense';

export class TypesenseProductMapper {
  public static FromTypesense(document: ITypesense.ProductDocument, language: string): IProduct {
    // Extract title based on new structure (can be string or object)
    const title =
      typeof document.title === 'object' && document.title !== null
        ? document.title[language] || document.title.en || Object.values(document.title)[0] || 'Unknown Product'
        : String(document.title || 'Unknown Product');

    // Extract description based on new structure
    const description =
      typeof document.description === 'object' && document.description !== null
        ? document.description[language] || document.description.en || Object.values(document.description)[0] || ''
        : String(document.description || '');

    // Handle new image structure
    const primaryImageUrl = document.image_url || document.media?.[0]?.imageSrc || '';
    const hoverImageUrl = document.hover_image_url || document.media?.[1]?.imageSrc || null;

    // Map all images if available
    let images: Array<{ src: string; alt: string }> = [];
    if (document.images && Array.isArray(document.images)) {
      images = document.images.map((url, index) => ({
        src: url,
        alt: `${title} - Image ${index + 1}`,
      }));
    } else if (document.media) {
      images = document.media.map((m) => ({
        src: m.imageSrc,
        alt: m.imageAlt,
      }));
    }

    // Handle SKU - prefer direct sku field over product_sku
    const sku = document.sku || document.product_sku || '';

    // Handle variants - check both new and legacy structures
    const variants = document.variants || document.productVariants;
    const mappedVariants =
      variants?.map((variant, index) => {
        // Handle variant title
        let variantTitle = `Variant ${variant.sku}`;
        if (variant.title) {
          if (Array.isArray(variant.title) && variant.title.length > 0) {
            variantTitle = variant.title.join(' ');
          } else if (typeof variant.title === 'string') {
            variantTitle = variant.title;
          }
        }

        // Get variant price if using legacy structure
        let variantPrice = undefined;
        if ('regularPrices' in variant && variant.regularPrices?.[0]) {
          variantPrice = {
            id: String(variant.id),
            basePriceAmount: variant.regularPrices[0].price || 0,
            salePriceAmount: variant.regularPrices[0].price || 0,
            discountAmount: 0,
          };
        }

        return {
          id: String(variant.id),
          title: variantTitle,
          sku: variant.sku,
          variant: variant.sku,
          ean: variant.ean || '',
          order: index,
          size: undefined,
          price: variantPrice,
          stock: {
            id: String(variant.id),
            quantity: variant.stock || 0,
            isAvailable: variant.in_stock === true || (variant.stock || 0) > 0,
            validateStock: true,
            inventories: [],
          },
        };
      }) || [];

    return {
      id: String(document.id),
      key: String(document.id),
      title: title,
      display_name: title,
      thumbnail: {
        url: primaryImageUrl,
        hoverUrl: hoverImageUrl,
      },
      color: Array.isArray(document.color) ? document.color : [document.color || ''],
      status: (document.status || (document.in_stock ? 'ACTIVE' : 'INACTIVE')) as ProductStatusEnum,
      slug: document.slug || '',
      slugSv: document.slug || '',
      compare_at: null,
      discount: null,

      sku: sku,
      mpn: document.mpn || '',
      externalId: document.external_id || '',
      cloneId: null,
      productType: document.type || '',
      productGroup: document.product_group_identifier || '',
      description: description,
      images: images,
      brinkId: document.external_id || '',
      variants: mappedVariants,

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

      // Optional date fields - handle both naming conventions
      releaseDate: document.release_date,
      releaseDateTimestamp: document.releaseDateTimestamp,
      outOfStockAt: document.out_of_stock_at,
      outOfStockAtTimestamp: document.outOfStockAtTimestamp,
      updatedAt: document.updated_at,
      updatedAtTimestamp: document.updated_at_timestamp || document.updatedAtTimestamp,
      createdAt: document.created_at,
      createdAtTimestamp: document.created_at_timestamp || document.createdAtTimestamp,

      // Attributes - include custom attributes if available
      attributes: {
        materials: document.material,
        ...(document.custom_attributes && Array.isArray(document.custom_attributes)
          ? document.custom_attributes.reduce((acc, attr) => ({ ...acc, ...attr }), {})
          : {}),
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
