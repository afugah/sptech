import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';

export interface IShoplabService {
  getAllPageSlugs: () => Promise<IShoplab.SlugItem[]>;

  getCollections: (locale: string) => Promise<IShoplab.Collections>;

  getCollectionBySlug: (locale: string, slug: string) => Promise<IShoplab.Collection | null>;

  getNavigation: (locale: string) => Promise<IShoplab.Navigation>;
  getNewPayloadNavigation: (locale: string) => Promise<IShoplab.NewNavigation>;

  getSitemapCollections: (locale: string) => Promise<IShoplab.SitemapCollections>;

  getSitemapProducts: (locale: string) => Promise<IShoplab.SitemapProducts>;
}
