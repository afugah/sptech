import { ProductStatusEnum } from '@/src/lib/constants/ProductStatusEnum';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { getSalePrice } from '@/src/lib/framework/Collection/shared/getSalePrice';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';

export class FindifyCollectionItemMapper {
  public static FromFindify = (item: IFindify.Item): ICollectionItem => {
    return {
      id: item.id,
      key: item.selected_variant_id,
      sku: item.selected_variant_id,
      title: item.title,
      // display_name: FindifyCollectionItemMapper.parseDisplayName(item.custom_fields?.display_name),
      display_name: '',
      created_at: item.created_at ? new Date(item.created_at) : 0,
      color: item.color,
      thumbnail: {
        url: item.image_url,
        hoverUrl: item.custom_fields?.product_image_hover_url?.[0],
      },
      status: item.availability ? ProductStatusEnum.Active : ProductStatusEnum.Inactive,
      slug: item.custom_fields?.full_slug?.[0] ?? '#',
      stock: item.quantity ?? 0,
      price: item.price[0] ?? 0,
      salePrice: getSalePrice(item.price[0], item.custom_fields.sale_price),
      compare_at: item.compare_at,
      tags: item.custom_fields?.productflags
        ?.map((flag) => {
          try {
            const placeholder = '__PERCENT__';
            const replacedFlag = flag.replace(/%(?![0-9A-Fa-f]{2})/g, placeholder);
            const uriDecoded = decodeURIComponent(replacedFlag);
            const restoredFlag = uriDecoded.replace(new RegExp(placeholder, 'g'), '%');
            const unicodeDecoded = restoredFlag.replace(/\\u([0-9a-fA-F]{4})|u00([0-9a-fA-F]{2})/g, (_, p1, p2) =>
              String.fromCharCode(parseInt(p1 || p2, 16)),
            );
            return JSON.parse(unicodeDecoded);
          } catch {
            return null;
          }
        })
        .filter(Boolean),
      discount: item.discount,
      otherColors: JSON.parse(item.custom_fields.othercolors?.[0] ?? '[]'),
      sizes: FindifyCollectionItemMapper.getSizes(item),
      onlinedate: FindifyCollectionItemMapper.parseDate(item.custom_fields?.onlinedate?.[0]),
      coming_soon_publish_date: FindifyCollectionItemMapper.parseDate(item.custom_fields?.comingsoonpublishdate?.[0]),
      new_until_date: FindifyCollectionItemMapper.parseDate(item.custom_fields?.newuntildate?.[0]),
      pricing: {
        WEB: {
          SE: {
            price: Number(item.custom_fields['price|web_se']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|web_se']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|web_se']?.[0]) ?? 0,
          },
          FI: {
            price: Number(item.custom_fields['price|web_fi']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|web_fi']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|web_fi']?.[0]) ?? 0,
          },
          NO: {
            price: Number(item.custom_fields['price|web_no']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|web_no']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|web_no']?.[0]) ?? 0,
          },
        },
        MEMBER: {
          SE: {
            price: Number(item.custom_fields['price|member_se']?.[0]) ?? 1,
            sale_price: Number(item.custom_fields['sale_price|member_se']?.[0]) ?? 2,
            discount: Number(item.custom_fields['discount|member_se']?.[0]) ?? 3,
          },
          FI: {
            price: Number(item.custom_fields['price|member_fi']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member_fi']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member_fi']?.[0]) ?? 0,
          },
          NO: {
            price: Number(item.custom_fields['price|member_no']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member_no']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member_no']?.[0]) ?? 0,
          },
        },
        'MEMBER-SILVER': {
          SE: {
            price: Number(item.custom_fields['price|member-silver_se']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-silver_se']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-silver_se']?.[0]) ?? 0,
          },
          FI: {
            price: Number(item.custom_fields['price|member-silver_fi']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-silver_fi']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-silver_fi']?.[0]) ?? 0,
          },
          NO: {
            price: Number(item.custom_fields['price|member-silver_no']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-silver_no']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-silver_no']?.[0]) ?? 0,
          },
        },
        'MEMBER-GOLD': {
          SE: {
            price: Number(item.custom_fields['price|member-gold_se']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-gold_se']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-gold_se']?.[0]) ?? 0,
          },
          FI: {
            price: Number(item.custom_fields['price|member-gold_fi']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-gold_fi']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-gold_fi']?.[0]) ?? 0,
          },
          NO: {
            price: Number(item.custom_fields['price|member-gold_no']?.[0]) ?? 0,
            sale_price: Number(item.custom_fields['sale_price|member-gold_no']?.[0]) ?? 0,
            discount: Number(item.custom_fields['discount|member-gold_no']?.[0]) ?? 0,
          },
        },
      },
      // Convert custom_fields to match expected type, filtering out null values and converting numbers to strings
      custom_fields: Object.entries(item.custom_fields).reduce(
        (acc, [key, value]) => {
          if (value === null || value === undefined) {
            return acc;
          }
          if (typeof value === 'number') {
            acc[key] = value.toString();
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string | string[]>,
      ),
    };
  };

  private static parseDisplayName(displayName: string | undefined): Record<string, string | null> {
    try {
      if (!displayName) return {};

      let jsonString: string;

      // If it's an array with a JSON string (as shown in the example)
      if (Array.isArray(displayName) && displayName.length > 0) {
        jsonString = displayName[0];
      } else {
        // If it's directly a JSON string
        jsonString = displayName;
      }

      // Handle Unicode escape sequences before parsing
      const decodedString = jsonString.replace(/\\u([0-9a-fA-F]{4})|u00([0-9a-fA-F]{2})/g, (_, p1, p2) =>
        String.fromCharCode(parseInt(p1 || p2, 16)),
      );

      return JSON.parse(decodedString);
    } catch (error) {
      console.error('Error parsing display_name:', error);
      return {};
    }
  }

  private static getSizes(item: IFindify.Item): { size: string; inStock: boolean }[] {
    if (!item.size || item.size.length === 0) {
      return [];
    }

    return item.size.map((size) => ({
      size,
      inStock: !!item.stickers?.['in-stock'], // Use stickers to check stock availability
    }));
  }

  private static parseDate(dateString: string | undefined): string | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
