import { isNil, omitBy } from 'lodash';
import { type IGtmItem } from '@/src/context/analytics/types';
// import { type IGtmDetailedItem } from '@/src/context/analytics/types';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type CartDiscountCode, type ShopperCartItem, type TransactionItem } from '@/src/lib/types/session';

export class AnalyticsEventBuilder {
  private _eventType: string | null = null;
  private readonly _time?: string;

  private _cartRef?: string;
  private _title?: string;
  private _gtagType?: 'hard' | 'dynamic';
  private _pageType?: string;
  private _contactId?: string;
  private _market?: string;
  private _language?: string;
  private _currency?: string;
  private _tax?: number;
  private _shipping?: number;
  private _transaction_id?: string;
  private _coupon?: string;
  private _value?: number;
  private _items?: (ICollectionItem | IProduct | ShopperCartItem | TransactionItem)[];
  private _gtagCustomData?: Record<string, unknown>;
  private _cartItems?: ShopperCartItem[];
  private _skus?: string[];

  private _url?: string;
  private _locale?: string;
  private _categories?: {
    item_category: string | null;
    item_category2: string | null;
    item_category3: string | null;
  }[];

  private get _pathname(): string | undefined {
    if (!this._url) return undefined;

    if (!this._locale) return this._url;

    if (this._url.startsWith('/')) return `/${this._locale}${this._url}`;

    return `/${this._locale}/${this._url}`;
  }

  public constructor() {
    this._time = new Date().toISOString();
  }

  public buildGtmEvent(): Record<string, unknown> {
    if (!this._eventType) {
      console.error('[AnalyticsEventBuilder] Event type is required');
      return {};
    }

    const items = this._items?.map((item) => this.itemToGtagItem(item));
    // const detailedProducts = this._items?.filter(this.isProduct);

    const result = {
      event: this._eventType,
      // cartRef: this._cartRef,
      // title: this._title,
      // url: this._pathname,
      // pageType: this._pageType,
      // type: this._gtagType,
      // market: this._market,
      // currency: this._currency,
      // language: this._language,
      // time: this._time,
      // tax: this._tax ? this._tax / 100 : undefined,
      // contactId: this._contactId,
      // coupon: this._coupon,
      // items: items,
      // skus: this._skus,
      // transaction_id: this._transaction_id,
      // value: this._value ? this._value / 100 : undefined,
      // cartItems: this._cartItems?.length
      //   ? this._cartItems.map((item) => this.cartItemToGtagDetailedItem(item))
      //   : undefined,

      ecommerce: items
        ? omitBy(
            {
              currency: this._currency,
              transaction_id: this._transaction_id,
              tax: this._tax ? this._tax / 100 : undefined,
              coupon: this._coupon,
              shipping: this._shipping ? this._shipping / 100 : undefined,
              value:
                this._eventType === 'purchase'
                  ? this._value
                    ? this._value / 100
                    : undefined
                  : items.reduce((acc, item) => acc + (item.price ?? 0), 0),
              items,
              // skus: this._skus,
              // detail: detailedProducts
              //   ? { products: detailedProducts.map((item) => this.productToGtagDetailedItem(item)) }
              //   : undefined,
            },
            isNil,
          )
        : undefined,

      ...this._gtagCustomData,
    };
    return omitBy(result, isNil);
  }

  public reset(): AnalyticsEventBuilder {
    this._eventType = null;
    this._title = undefined;
    this._skus = undefined;
    this._gtagType = undefined;
    this._pageType = undefined;
    this._contactId = undefined;
    this._market = undefined;
    this._language = undefined;
    this._currency = undefined;
    this._tax = undefined;
    this._transaction_id = undefined;
    this._coupon = undefined;
    this._value = undefined;
    this._items = undefined;
    this._gtagCustomData = undefined;
    this._cartItems = undefined;
    this._url = undefined;
    this._locale = undefined;
    this._categories = undefined;
    return this;
  }

  public buildDebug(): Record<string, unknown> {
    const result = {
      tax: this._tax,
      transactionId: this._transaction_id,
      skus: this._skus,
      coupon: this._coupon,
      categories: this._categories,
      value: this._value ? this._value / 100 : undefined,
      eventType: this._eventType,
      time: this._time,
      title: this._title,
      gtagType: this._gtagType,
      pageType: this._pageType,
      contactId: this._contactId,
      market: this._market,
      language: this._language,
      currency: this._currency,
      items: this._items,
      gtagCustomData: this._gtagCustomData,
      cartItems: this._cartItems,
      locale: this._locale,
      url: this._url,
      pathname: this._pathname,
    };

    return omitBy(result, isNil);
  }

  /* #region Base builder */

  public setEventType(eventType: string): AnalyticsEventBuilder {
    this._eventType = eventType;

    return this;
  }

  public withLocale(locale: string): AnalyticsEventBuilder {
    this._locale = locale;

    return this;
  }

  public withCartRef(CartRef: string | undefined): AnalyticsEventBuilder {
    this._cartRef = CartRef;

    return this;
  }

  public withTitle(title: string): AnalyticsEventBuilder {
    this._title = title;

    return this;
  }

  public withUrl(url: string): AnalyticsEventBuilder {
    this._url = url;

    return this;
  }

  public withPageType(pageType: string): AnalyticsEventBuilder {
    this._pageType = pageType;

    return this;
  }

  public withTransactionId(id: string): AnalyticsEventBuilder {
    this._transaction_id = id;

    return this;
  }

  public withTransactionValue(value: number): AnalyticsEventBuilder {
    this._value = value;

    return this;
  }

  public withContactId(contactId: string | undefined): AnalyticsEventBuilder {
    if (contactId) {
      this._contactId = contactId;
    }

    return this;
  }

  public withMarket(market: string): AnalyticsEventBuilder {
    this._market = market;

    return this;
  }

  public withLanguage(language: string): AnalyticsEventBuilder {
    this._language = language;

    return this;
  }

  public withCurrency(currency: string): AnalyticsEventBuilder {
    this._currency = currency;

    return this;
  }

  public withTax(tax: number): AnalyticsEventBuilder {
    this._tax = tax;

    return this;
  }

  public withShipping(shipping: number): AnalyticsEventBuilder {
    this._shipping = shipping;

    return this;
  }

  public withSkus(
    items: ShopperCartItem[] | ShopperCartItem | TransactionItem | TransactionItem[] | IProduct | IProduct[],
  ): AnalyticsEventBuilder {
    const itemsArray = Array.isArray(items) ? items : [items];
    this._skus = itemsArray.map((item) => {
      if (this.isProduct(item)) {
        return item.sku;
      }
      if (this.isShopperCartItem(item)) {
        return item.customAttributes.ean;
      } else {
        return item.item_id;
      }
    });
    return this;
  }

  public withCategories(
    items: ShopperCartItem[] | ShopperCartItem | TransactionItem | TransactionItem[] | IProduct | IProduct[],
  ): AnalyticsEventBuilder {
    const itemsArray = Array.isArray(items) ? items : [items];

    this._categories = itemsArray.map((item) => {
      let slug: string;
      if (this.isShopperCartItem(item) || this.isProduct(item)) {
        slug = item.slug ?? '';
      } else {
        slug = `${item.item_category}/${item.item_category2}/${item.item_category3}` || '';
      }

      // Ensure categories is always an array before using slice
      let categories = slug.split('/').filter(Boolean) || [];

      if (categories.length > 1) {
        categories = categories.slice(0, -1);
      }

      // Ensure we're not calling slice on undefined
      categories = categories.slice(0, 3);

      return {
        item_category: categories[0] || null,
        item_category2: categories[1] || null,
        item_category3: categories[2] || null,
      };
    });

    return this;
  }

  public withCoupon(coupon?: CartDiscountCode): AnalyticsEventBuilder {
    this._coupon = coupon?.code;

    return this;
  }

  public withItems(
    items:
      | ICollectionItem[]
      | ICollectionItem
      | IProduct[]
      | IProduct
      | ShopperCartItem[]
      | ShopperCartItem
      | TransactionItem[],
  ): AnalyticsEventBuilder {
    this._items = Array.isArray(items) ? items : [items];
    return this;
  }

  public withItemListName(item_list_name: string): this {
    if (this._items && item_list_name) {
      this._items = this._items.map((item) => ({
        ...item,
        item_list_name,
      }));
    }
    return this;
  }

  public withCartItems(cartItems: ShopperCartItem[] | undefined): AnalyticsEventBuilder {
    if (cartItems) {
      this._cartItems = cartItems;
    }

    return this;
  }

  /* #endregion */

  /* #region Gtag */

  public withGtagCustomData(data: Record<string, unknown>): AnalyticsEventBuilder {
    this._gtagCustomData = { ...this._gtagCustomData, ...data };

    return this;
  }

  public withGtagType(type: 'hard' | 'dynamic'): AnalyticsEventBuilder {
    this._gtagType = type;

    return this;
  }

  /* #endregion */

  /* #region Utils */

  public itemToGtagItem(item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem): IGtmItem {
    if (this.isProduct(item)) {
      return this.createProductGtagItem(item);
    }

    if (this.isCollectionItem(item)) {
      return this.createCollectionItemGtagItem(item);
    }

    if (this.isShopperCartItem(item)) {
      return this.createShopperCartItemGtagItem(item);
    }

    if (this.isTransactionItem(item)) {
      return this.createTransactionItemGtagItem(item);
    }

    console.error('[AnalyticsEventBuilder] Invalid item type', item);
    return {} as IGtmItem;
  }

  private getCategoriesFromSlug(item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem) {
    let categories: (string | undefined)[] = [];

    if (this.isProduct(item) || this.isCollectionItem(item)) {
      categories = item?.slugSv?.split('/').filter(Boolean) || [];
    }
    if (this.isShopperCartItem(item) || this.isTransactionItem(item)) {
      categories = item.customAttributes.fullSlug_sv?.split('/').filter(Boolean);
    }
    // if (this.isTransactionItem(item)) {
    //   categories = [item.item_category, item.item_category2, item.item_category3, item.item_category4];
    // }
    if (categories?.length > 1) {
      categories = categories.slice(0, -1);
    }

    categories = categories.slice(0, 3);

    return {
      ...(categories[0] ? { item_category: categories[0] } : {}),
      ...(categories[1] ? { item_category2: categories[1] } : {}),
      ...(categories[2] ? { item_category3: categories[2] } : {}),
      // item_category: categories[0] || null,
      // item_category2: categories[1] || null,
      // item_category3: categories[2] || null,
    };
  }

  private formatItemName(name: string): string {
    if (!name) return '';

    const parts = name.split(' - ');
    if (parts.length >= 3) {
      return `${parts[0]} - ${parts[1]}`;
    }

    return name;
  }

  // view_item
  private createCollectionItemGtagItem(item: ICollectionItem): IGtmItem {
    const formattedName = this.formatItemName(item.title);
    return {
      item_id: item.sku,
      item_name: formattedName,
      price: item.price,

      discount: item.discount,
      // item_org_price: item.compare_at ? item.compare_at / 100 : null,
      quantity: 1,
      ...this.getCategoriesFromSlug(item),
      item_brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
    };
  }

  // purchase
  private createTransactionItemGtagItem(item: TransactionItem): IGtmItem {
    const formattedName = this.formatItemName(item.item_name);
    return {
      ...this.getCategoriesFromSlug(item),
      item_brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
      price: item.price,
      discount: item.discount,
      quantity: 1,
      item_id: item.item_id,
      item_name: formattedName,
      // coupon: item.coupon?.code,
    };
  }

  // pageview, add_to_cart
  private createProductGtagItem(item: IProduct & { item_list_name?: string }): IGtmItem {
    const variant = this.getProductVariant(item);
    const price = variant?.price?.salePriceAmount ?? variant?.price?.basePriceAmount ?? 0;
    const discount = variant?.price?.discountAmount ?? 0;
    let sku = item.sku;
    if (this._eventType !== 'productDetailView' && this._eventType !== 'view_item' && variant?.ean) {
      sku = variant.ean;
    }

    const formattedName = this.formatItemName(item.title);
    return {
      item_id: sku,
      item_name: formattedName,
      price: price / 100,
      discount: discount / 100,
      // item_org_price: item.compare_at ? item.compare_at / 100 : null,
      quantity: 1,
      ...this.getCategoriesFromSlug(item),
      ...(item.item_list_name ? { item_list_name: item.item_list_name } : {}),
      item_brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
    };
  }

  // Item: add_to_cart
  private createShopperCartItemGtagItem(item: ShopperCartItem & { item_list_name?: string }): IGtmItem {
    const formattedName = this.formatItemName(item.name);
    return {
      item_id: item.customAttributes.ean,
      item_name: formattedName,
      price: (item?.salePriceAmount ?? item?.basePriceAmount ?? 0) / 100,
      discount: item.discountAmount / 100,
      // item_org_price: item.basePriceAmount ? item.basePriceAmount / 100 : null,
      quantity: item.quantity,
      ...this.getCategoriesFromSlug(item),
      item_list_name: item.item_list_name || null,
      item_brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
    };
  }

  // Item Detail: add_to_cart
  // private cartItemToGtagDetailedItem(item: ShopperCartItem): IGtmDetailedItem {
  //   return {
  //     id: item.customAttributes.ean,
  //     name: item.name,
  //     sku: item.customAttributes.ean,
  //     quantity: item.quantity,
  //     price: item.totalPriceAmount / 100,
  //
  //     variant: item.productVariantId,
  //     ...this.getCategoriesFromSlug(item),
  //   };
  // }
  //
  // private productToGtagDetailedItem(item: IProduct): IGtmDetailedItem {
  //   const variant = this.getProductVariant(item);
  //
  //   return {
  //     id: variant?.sku ?? item.sku,
  //     name: item.title,
  //     sku: variant?.sku ?? item.sku,
  //     quantity: 1,
  //     price: (variant?.price?.salePriceAmount ?? variant?.price?.basePriceAmount ?? 0) / 100,
  //     variant: variant?.ean ?? '',
  //     ...this.getCategoriesFromSlug(item),
  //   };
  // }

  private getProductVariant(item: IProduct): IProductVariant | undefined {
    // Reference to `ProductPage.selectedVariantSku`s
    return item.variants?.find((v) => v.sku === item.sku) ?? item.variants?.find(() => true);
  }

  private isProduct(item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem): item is IProduct {
    return 'mpn' in item;
  }

  private isCollectionItem(
    item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem,
  ): item is ICollectionItem {
    return 'thumbnail' in item;
  }

  private isShopperCartItem(
    item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem,
  ): item is ShopperCartItem {
    return 'productVariantId' in item;
  }

  private isTransactionItem(
    item: ICollectionItem | IProduct | ShopperCartItem | TransactionItem,
  ): item is TransactionItem {
    return 'index' in item;
  }

  /* #endregion */
}
