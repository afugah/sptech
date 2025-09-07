import { ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { getSalePrice } from '@/src/lib/framework/Collection/shared/getSalePrice';
import { type IAlgolia } from '@/src/lib/framework/Collection/types/IAlgolia';

export class AlgoliaCollectionItemMapper {
  public static FromAlgolia = (item: IAlgolia.ItemBase): ICollectionItem => ({
    id: item.product_sku,
    key: item.objectID,
    title: item.title,
    display_name: '',
    color: [],
    created_at: 0,
    thumbnail: {
      url: item.media[0],
      hoverUrl: undefined,
    },
    status: item.status === 'ACTIVE' ? ProductStatusEnum.Active : ProductStatusEnum.Inactive,
    slug: item.slug,
    slugSv: '',
    stock: item.stock ?? 0,
    price: item.regular_price,
    salePrice: getSalePrice(item.regular_price, item.sale_price),
    compare_at: null,
    tags: [],
    discount: null,
    otherColors: [],
    sku: item.product_sku,
    onlinedate: null,
    coming_soon_publish_date: null,
    new_until_date: null,
    sizes: [],
    pricing: {
      WEB: {
        SE: {
          price: null,
          sale_price: null,
          discount: null,
        },
        FI: {
          price: null,
          sale_price: null,
          discount: null,
        },
        NO: {
          price: null,
          sale_price: null,
          discount: null,
        },
      },
      MEMBER: {
        SE: {
          price: null,
          sale_price: null,
          discount: null,
        },
        FI: {
          price: null,
          sale_price: null,
          discount: null,
        },
        NO: {
          price: null,
          sale_price: null,
          discount: null,
        },
      },
      'MEMBER-SILVER': {
        SE: {
          price: null,
          sale_price: null,
          discount: null,
        },
        FI: {
          price: null,
          sale_price: null,
          discount: null,
        },
        NO: {
          price: null,
          sale_price: null,
          discount: null,
        },
      },
      'MEMBER-GOLD': {
        SE: {
          price: null,
          sale_price: null,
          discount: null,
        },
        FI: {
          price: null,
          sale_price: null,
          discount: null,
        },
        NO: {
          price: null,
          sale_price: null,
          discount: null,
        },
      },
    },
  });

  public static FromAlgoliaVariant = (parent: IAlgolia.ItemBase, item: IAlgolia.ItemVariant): ICollectionItem => {
    const media = item.media?.length ? item.media : parent.media;

    return {
      id: item.sku,
      key: item.id.toString() || item.sku,
      title: parent.title,
      display_name: '',
      color: [],
      created_at: 0,
      thumbnail: {
        url: media[0],
        hoverUrl: undefined,
      },
      status: item.stock > 0 ? ProductStatusEnum.Active : ProductStatusEnum.Inactive,
      slug: `${parent.slug}?variant=${item.sku}`,
      slugSv: '',
      stock: item.stock ?? 0,
      price: item.regular_price,
      salePrice: getSalePrice(item.regular_price, item.sale_price),
      compare_at: null,
      tags: [],
      discount: null,
      otherColors: [],
      sku: item.sku,
      onlinedate: null,
      coming_soon_publish_date: null,
      new_until_date: null,
      sizes: [],
      pricing: {
        WEB: {
          SE: {
            price: null,
            sale_price: null,
            discount: null,
          },
          FI: {
            price: null,
            sale_price: null,
            discount: null,
          },
          NO: {
            price: null,
            sale_price: null,
            discount: null,
          },
        },
        MEMBER: {
          SE: {
            price: null,
            sale_price: null,
            discount: null,
          },
          FI: {
            price: null,
            sale_price: null,
            discount: null,
          },
          NO: {
            price: null,
            sale_price: null,
            discount: null,
          },
        },
        'MEMBER-SILVER': {
          SE: {
            price: null,
            sale_price: null,
            discount: null,
          },
          FI: {
            price: null,
            sale_price: null,
            discount: null,
          },
          NO: {
            price: null,
            sale_price: null,
            discount: null,
          },
        },
        'MEMBER-GOLD': {
          SE: {
            price: null,
            sale_price: null,
            discount: null,
          },
          FI: {
            price: null,
            sale_price: null,
            discount: null,
          },
          NO: {
            price: null,
            sale_price: null,
            discount: null,
          },
        },
      },
    };
  };

  // #region Utils

  protected static readonly getDescription = (descriptionHtml = '', usps: Array<string | undefined> = []): string => {
    descriptionHtml = descriptionHtml.trim();

    const filteredUsp = usps.filter((usp) => !!usp).map((usp) => `<li>${usp}</li>`);
    if (!filteredUsp.length) return descriptionHtml;

    const uspHtml = `<ul>${filteredUsp.join('')}</ul>`;
    if (!descriptionHtml.length) return uspHtml;
    return `${descriptionHtml}<br/>${uspHtml}`;
  };

  // #endregion
}
