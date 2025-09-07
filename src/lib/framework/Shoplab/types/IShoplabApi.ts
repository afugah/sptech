export namespace IShoplabApi {
  export interface Links {
    data: Array<{
      id: number;
      slug: string;
    }>;
  }

  export interface Redirect {
    data: Array<{
      from: string;
      to: string;
      market: string;
      type: string;
    }>;
  }

  interface CollectionItem {
    id: number;
    title: string;
    slug: string;
    full_slug: string;
    filter: unknown[];
    parent_id: number | null;
    path: string;
    order: number;
    attributes: {
      CollectionDescription: {
        id: number;
        title: string;
        value: Record<string, string>;
        type: 'TEXTAREA';
        key: string;
        isTranslateable: boolean;
      };
      collectionMetaDescription: {
        id: number;
        title: string;
        value: Record<string, string>;
        type: 'TEXTAREA';
        key: string;
        isTranslateable: boolean;
      };
      customTitle: {
        id: number;
        title: string;
        value: Record<string, string>;
        type: 'TEXT_INPUT';
        key: string;
        isTranslateable: boolean;
      };
      collectionMetaTitle: {
        id: number;
        title: string;
        value: Record<string, string>;
        type: 'TEXT_INPUT';
        key: string;
        isTranslateable: boolean;
      };
    };
  }

  export interface Collections {
    data: Array<CollectionItem>;
  }

  export interface NavigationItem {
    id: string;
    label: string;
    name: string;
    type: string;
    value: string;
    url: string;
    parentUrl: string;
    parentId: string;
    children: Record<string, NavigationItem>;
  }

  export interface Navigation {
    data: {
      id: number;
      name: string;
      handle: string;
      items: Record<string, NavigationItem>;
    };
  }
  export interface IBackInStockRequest {
    product_variant: string;
    sku: string;
    customer_email: string;
    lang_code?: string;
  }

  export interface SitemapProduct {
    id: number;
    slug: string;
    lastModified: string;
  }

  export interface SitemapProducts {
    data: Array<SitemapProduct>;
  }

  export interface SitemapCollection {
    id: number;
    slug: string;
    lastModified: string;
  }
  export interface SitemapCollections {
    data: Array<SitemapCollection>;
  }
}
