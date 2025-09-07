export namespace IShoplab {
  export type SlugItem = {
    locale?: string;
    slug: string | string[];
  };

  export type RedirectURL = {
    from: string;
    to: string;
    market: string;
    type: string;
  };

  export interface Collection {
    id: number;

    fullSlug: string;
    slugList: string[];

    title: string;
    description: string;

    meta: {
      title: string;
      description: string;
    };
  }

  export type Collections = Map<string, Collection>;

  export interface NavigationItem {
    id: string;
    title: string;
    url: string;
    type: string;

    children: NavigationItem[];
  }

  export type Navigation = NavigationItem[];

  /*NewNavigation*/
  export interface Image {
    createdAt: string;
    updatedAt: string;
    alt: string;
    prefix: string;
    filename: string;
    mimeType: string;
    filesize: number;
    width: number;
    height: number;
    focalX: number;
    focalY: number;
    id: string;
    url: string;
    thumbnailURL: string | null;
  }

  export interface ImageWithUrl {
    linkText: string;
    image: Image;
    url: string;
  }

  export interface ImageWithUrlWrapper {
    imageWithUrl: ImageWithUrl;
    id: string;
  }

  export interface ImageItem {
    name: string;
    image: Image;
    id: string;
  }

  export interface Item {
    label: string;
    url: string;
    newTab: boolean;
    isActive: boolean;
    isFeatured: boolean;
    id: string;
  }

  export interface Child {
    label: string;
    url: string;
    items: Item[];
    id: string;
  }
  export interface SmallerNavigations {
    label: string;
    url: string;
    id: string;
  }

  export interface Children {
    createdAt: string;
    updatedAt: string;
    title: string;
    url: string;
    children: Child[];
    otherLinks: {
      label: string;
      url: string;
      id: string;
    }[];
    id: string;
  }
  export interface NavigationItemWithChildren {
    createdAt?: string;
    updatedAt?: string;
    marketName?: string;
    marketCode?: string;
    navigationItems: Children[];
    smallerNavigations: SmallerNavigations[];
    footerNavigations: SmallerNavigations[];
    id?: string;
  }

  export interface NewNavigationItem {
    docs: NavigationItemWithChildren[];
  }

  export type NewNavigation = NewNavigationItem['docs'];

  /* End of NewNavigation */
  export interface SitemapProduct {
    id: number;
    slug: string;
    lastModified: string;
  }

  export type SitemapProducts = SitemapProduct[];

  export interface SitemapCollection {
    id: number;
    slug: string;
    lastModified: string;
  }

  export type SitemapCollections = SitemapCollection[];
}
