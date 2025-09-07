import { isNil } from 'lodash';
import { ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { type LocalizedValue } from '@/src/types/product';
import { sortVariantsBySize } from '@/src/util/variants';

export class ElasticSearchProductMapper {
  public static FromElastic(
    item: IElasticSearch.Item,
    language: string | undefined,
    defaultLanguage: string,
  ): IProduct {
    return {
      ...this.BaseFromElastic(item, language, defaultLanguage),
      variants: sortVariantsBySize(this.GetVariants(item, language, defaultLanguage)),
      description: this.GetByLocale(item.description, language, defaultLanguage),
      images: item.media
        .sort((a, b) => a.order - b.order)
        .map((media) => ({ src: media.imageSrc, alt: media.imageAlt })),
      thumbnail: {
        url: item.media?.[0]?.imageSrc,
        hoverUrl: undefined,
      },
      brinkId: item.brink_id,
      mpn: item.mpn,
      externalId: item.external_id,
      cloneId: item.clone_id,
      productType: item.type,
      productGroup: item.product_group_identifier,
      color: [],
      productColor: this.GetByLocale(item.attributes.color?.value ?? null, language, defaultLanguage),
      compare_at: null,
      discount: null,
      display_name: this.GetByLocale(item.title, language, defaultLanguage),
      primaryCollection: item.primaryCollection
        ? {
            title: this.GetByLocale(item.primaryCollection.title, language, defaultLanguage),
            slug: this.GetByLocale(item.primaryCollection.slug, language, defaultLanguage),
          }
        : null,
      breadcrumbs:
        item.primaryCollection?.breadcrumbs?.map((crumb) => ({
          title: this.GetByLocale(crumb.title, language, defaultLanguage),
          slug: this.GetByLocale(crumb.slug, language, defaultLanguage),
          full_slug: this.GetByLocale(crumb.full_slug, language, defaultLanguage),
        })) || [],
      productColors: item.productGroupProducts
        ?.filter((product) => product.status === 'ACTIVE')
        ?.map((color) => ({
          ...this.BaseFromElastic(color, language, defaultLanguage),
          image: color.image,
        })),
      productGroupProducts: item.productGroupProducts?.map((product) => ({
        id: product.id,
        title: product.title as unknown as LocalizedValue,
        image: product.image,
        product_sku: product.product_sku,
        slug: product.slug as unknown as LocalizedValue,
        fullSlug: product.fullSlug as unknown as Partial<LocalizedValue>,
        status: product.status as 'ACTIVE' | 'INACTIVE',
        stockSum: 0, // Will be populated from stock data
        attributes: (product.attributes || []) as unknown as Record<string, unknown>[],
        material: product.attributes?.material
          ? {
              value: product.attributes.material.value as unknown as LocalizedValue,
              external_id: product.attributes.material.external_id,
              display_name: product.attributes.material.value as unknown as LocalizedValue, // Use value as display name
            }
          : undefined,
      })),
      isVariantAsImage: false,
      attributes: this.GetAttributes(item, language, defaultLanguage),
      quote: this.GetByLocale(item.attributes.quote?.value ?? null, language, defaultLanguage),
      quoteBy: item.attributes.quoteBy?.value,
      sanity_category: item.attributes.sanity_category?.slug?.en,
      season: this.GetByLocale(item.attributes.season?.value ?? null, language, defaultLanguage),
      stockType: this.GetByLocale(item.attributes.stocktype?.value ?? null, language, defaultLanguage),
      targetGroup: this.GetByLocale(item.attributes.targetGroup?.value ?? null, language, defaultLanguage),
      material: this.GetByLocale(item.attributes.material?.value ?? null, language, defaultLanguage),
      collection: this.GetByLocale(item.attributes.collection?.value ?? null, language, defaultLanguage),
      label: this.GetByLocale(item.attributes.label?.value ?? null, language, defaultLanguage),
      mainCategory: this.GetByLocale(item.attributes.mainCategory?.value ?? null, language, defaultLanguage),
      categoryCode: this.GetByLocale(item.attributes.categoryCode?.value ?? null, language, defaultLanguage),

      //dates
      releaseDate: item.release_date,
      releaseDateTimestamp: item.releaseDateTimestamp,
      outOfStockAt: item.out_of_stock_at,
      outOfStockAtTimestamp: item.outOfStockAtTimestamp,
      updatedAt: item.updated_at,
      updatedAtTimestamp: item.updatedAtTimestamp,
      createdAt: item.created_at,
      createdAtTimestamp: item.createdAtTimestamp,

      // Will be hydrated from ReviewService
      reviewScore: null,

      // categories: {
      //   itemCategory: {
      //     id: item.productGroup.attributes.ITEMCATEGORY?.external_id,
      //     title: this.GetByLocale(item.productGroup.attributes.ITEMCATEGORY?.value, language, defaultLanguage),
      //     slug: this.GetByLocale(item.productGroup.attributes.ITEMCATEGORY?.slug, language, defaultLanguage),
      //   },
      //   itemClass: {
      //     id: item.productGroup.attributes.ITEMCLASS?.external_id,
      //     title: this.GetByLocale(item.productGroup.attributes.ITEMCLASS?.value, language, defaultLanguage),
      //     slug: this.GetByLocale(item.productGroup.attributes.ITEMCLASS?.slug, language, defaultLanguage),
      //   },
      //   itemGroup: {
      //     id: item.productGroup.attributes.ITEMGROUP?.external_id,
      //     title: this.GetByLocale(item.productGroup.attributes.ITEMGROUP?.value, language, defaultLanguage),
      //     slug: this.GetByLocale(item.productGroup.attributes.ITEMGROUP?.slug, language, defaultLanguage),
      //   },
      //   itemType: {
      //     id: item.productGroup.attributes.ITEMTYPE?.external_id,
      //     title: this.GetByLocale(item.productGroup.attributes.ITEMTYPE?.value, language, defaultLanguage),
      //     slug: this.GetByLocale(item.productGroup.attributes.ITEMTYPE?.slug, language, defaultLanguage),
      //   },
      // },
    };
  }

  protected static GetAttributes(
    item: IElasticSearch.Item,
    language: string | undefined,
    defaultLanguage: string,
  ): IProduct['attributes'] {
    const result: IProduct['attributes'] = {};

    try {
      const { attributes: itemAttributes } = item;

      // Map new attribute structure
      result.season = this.GetByLocale(itemAttributes.season?.value ?? null, language, defaultLanguage);

      // Map pl_ prefixed attributes that contain measurements/details
      if (itemAttributes.pl_Length?.value) {
        result.model_length = this.GetByLocale(itemAttributes.pl_Length.value, language, defaultLanguage);
      }

      if (itemAttributes.pl_Decor?.value) {
        result.model_size = this.GetByLocale(itemAttributes.pl_Decor.value, language, defaultLanguage);
      }

      if (itemAttributes.pl_Pearls?.value) {
        result.materials = this.GetByLocale(itemAttributes.pl_Pearls.value, language, defaultLanguage);
      }

      if (itemAttributes.measurementInfo?.value) {
        result.packageSize = this.GetByLocale(itemAttributes.measurementInfo.value, language, defaultLanguage);
      }

      if (itemAttributes.engravingInfo?.value) {
        result.careInstructions = this.GetByLocale(itemAttributes.engravingInfo.value, language, defaultLanguage);
      }

      if (itemAttributes.resizeInfo?.value) {
        result.fit = this.GetByLocale(itemAttributes.resizeInfo.value, language, defaultLanguage);
      }

      // Map material arrays
      if (itemAttributes.pl_Material?.value && itemAttributes.pl_Material.value.length > 0) {
        result.material_main = itemAttributes.pl_Material.value
          .map((material) => this.GetByLocale(material, language, defaultLanguage))
          .join(', ');
      }
    } catch (e) {
      console.error('[GetAttributes] Failed to build attributes', e);
      return result;
    }

    return result;
  }

  protected static BaseFromElastic = (
    item: Pick<IElasticSearch.Item, 'id' | 'title' | 'product_sku' | 'slug' | 'fullSlug' | 'status' | 'attributes'>,
    language: string | undefined,
    defaultLanguage: string,
  ): Pick<
    IProduct,
    'id' | 'key' | 'title' | 'sku' | 'slug' | 'status' | 'baseColorCode' | 'product_flag' | 'productColor' | 'slugSv'
  > => ({
    id: item.id.toString(),
    key: item.id.toString(),
    title: this.GetByLocale(item.title, language, defaultLanguage),
    sku: item.product_sku,
    slug: this.GetByLocale(item.fullSlug, language, defaultLanguage),
    slugSv: this.GetByLocale(item.fullSlug, 'sv', defaultLanguage),
    status: item.status === 'ACTIVE' ? ProductStatusEnum.Active : ProductStatusEnum.Inactive,
    productColor: this.GetByLocale(item.attributes.color?.value ?? null, language, defaultLanguage),
    baseColorCode: undefined,
    product_flag:
      item.attributes.product_flag?.value?.map((flag: Record<string, string>) => ({
        title: this.GetByLocale(flag, language, defaultLanguage),
        textColor: '',
        backgroundColor: '',
      })) || [],
  });

  protected static GetVariants = (
    parent: IElasticSearch.Item,
    language: string | undefined,
    defaultLanguage: string,
  ): IProductVariant[] =>
    parent.productVariants
      .filter((variant: IElasticSearch.ProductVariant) => variant.status === 'ACTIVE')
      .map((variant) => ({
        id: variant.id.toString(),
        sku: variant.sku,
        ean: variant.ean,
        order: variant.order,
        title: this.GetByLocale(parent.title, language, defaultLanguage),
        variant: this.GetByLocale(variant.title, language, defaultLanguage),
        size: this.GetByLocale(variant.attributes.sizeDescription?.value ?? null, language, defaultLanguage),

        // Will be hydrated from Brink
        price: undefined,
        stock: undefined,
      }));

  protected static readonly GetStringAttribute = (
    attribute: IElasticSearch.ItemAttribute<Record<string, string> | null, 'AttributeValue'> | null | undefined,
    language: string | undefined,
    defaultLanguage: string,
  ): string | undefined => {
    if (isNil(attribute?.value)) return undefined;

    const result = this.GetByLocale(attribute.value, language, defaultLanguage);
    if (result === '' || result === null) return undefined;

    return result;
  };

  protected static readonly GetByLocale = (
    value: Record<string, string> | null,
    language: string | undefined,
    defaultLanguage: string,
  ): string => (value ? (value[language ?? defaultLanguage] ?? value[defaultLanguage] ?? '') : '');
}
