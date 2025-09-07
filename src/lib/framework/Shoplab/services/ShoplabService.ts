import { compact } from 'lodash';
import { unstable_cache } from 'next/cache';
import { inject, singleton } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IShoplabService } from '@/src/lib/framework/Shoplab/domain/IShoplabService';
import { type IShoplab } from '@/src/lib/framework/Shoplab/types/IShoplab';
import { type IShoplabApi } from '@/src/lib/framework/Shoplab/types/IShoplabApi';
import { StoryblokService } from '@/src/lib/framework/Storyblok/services/StoryblokService';
import { getMarketCode } from '@/src/util/locale';

@singleton()
export class ShoplabService implements IShoplabService {
  public payloadbaseUrl = process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3500';
  public constructor(
    @injectLogger('ShoplabService') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
    @inject(StoryblokService) private readonly _storyblokService: StoryblokService,
  ) {}

  /**
   * Get all page slugs for the `generateStaticParams` function.
   */
  public readonly getAllPageSlugs = unstable_cache(() => this._getAllPageSlugs(), ['ShoplabService.getAllPageSlugs'], {
    tags: ['ShoplabService.getAllPageSlugs'],
  });

  public readonly getCollections = unstable_cache(
    (locale: string) => this._getCollections(locale),
    ['ShoplabService.getCollections'],
    { tags: ['ShoplabService.getCollections'] },
  );

  public readonly getRedirects = unstable_cache(
    (locale: string) => this._getRedirects(locale),
    ['ShoplabService.getRedirects'],
    {
      tags: ['ShoplabService.getRedirects'],
    },
  );

  public readonly getCollectionBySlug = unstable_cache(
    (locale: string, slug: string) => this._getCollectionBySlug(locale, slug),
    ['ShoplabService.getCollectionBySlug'],
    { tags: ['ShoplabService.getCollectionBySlug'] },
  );

  public readonly getNavigation = unstable_cache(
    (locale: string) => this._getNavigation(locale),
    ['ShoplabService.getNavigation'],
    { tags: ['ShoplabService.getNavigation'] },
  );
  public readonly getNewPayloadNavigation = unstable_cache(
    (locale: string) => this._getNewPayloadNavigation(locale),
    ['ShoplabService.getNewPayloadNavigation'],
    { tags: ['ShoplabService.getNewPayloadNavigation'] },
  );

  public readonly getSitemapProducts = (locale: string) => this._getSitemapProducts(locale);

  public readonly getSitemapCollections = (locale: string) => this._getSitemapCollections(locale);

  public async notifyBackInStock(body: IShoplabApi.IBackInStockRequest): Promise<boolean> {
    try {
      await fetch(`${this._config.Shoplab.ApiUrl}/monitor/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._config.Shoplab.ApiKey}`,
        },
        body: JSON.stringify(body),
      });

      return true;
    } catch (error) {
      this._logger.error('Error sending back-in-stock notification', error);
      throw error;
    }
  }

  /* #region Get all page slugs */
  private async _getAllPageSlugs(): Promise<IShoplab.SlugItem[]> {
    this._logger.debug('Fetching all possible slugs');

    try {
      const storyblokSlugsPromise = this._storyblokService.getAllPageSlugs();

      // NOTE: Currently disabled
      const linksPromises = new Promise<IShoplab.SlugItem[]>((resolve) => resolve([])); //this.getLinkSlugs();

      const [storyblok, links] = await Promise.all([storyblokSlugsPromise, linksPromises]);

      const result = [...storyblok, ...links];

      return result;
    } catch (e) {
      this._logger.error('Error fetching slugs', e);
      throw e;
    }
  }

  protected readonly getLinkSlugs = unstable_cache(() => this._getLinkSlugs(), ['ShoplabService.getLinkSlugs'], {
    tags: ['ShoplabService.getLinkSlugs'],
  });

  /**
   * Very simplified version. Doesn't support double `en-se` locales
   */
  private async _getLinkSlugs(): Promise<IShoplab.SlugItem[]> {
    this._logger.debug('Fetching links');

    try {
      const linkPromises = this._config.Search.Markets.map(({ code, shoplabId }) =>
        this.fetch<IShoplabApi.Links>(shoplabId, `links`).then(({ data }) => ({
          locale: code.toLowerCase(),
          slugs: data.map((link) => this.getSlugListByFullSlug(link.slug)),
        })),
      );

      const results = await Promise.all(linkPromises);

      return results.flatMap<IShoplab.SlugItem>(({ locale, slugs }) => slugs.map((slug) => ({ locale: locale, slug })));
    } catch (e) {
      this._logger.error('Error fetching links', e);
      throw e;
    }
  }

  /* #endregion */

  /* #region Get redirects */
  private async _getRedirects(locale: string): Promise<IShoplab.RedirectURL[]> {
    this._logger.debug('Fetching redirects');

    try {
      const storefrontId = this.getStorefrontIdByLocale(locale);
      const { data } = await this.fetch<IShoplabApi.Redirect>(storefrontId, `redirects`);

      return data.map((redirect) => ({
        from: redirect.from,
        to: redirect.to,
        market: redirect.market,
        type: redirect.type,
      }));
    } catch (e) {
      this._logger.error('Error fetching redirects', e);
      throw e;
    }
  }

  /* #endregion */

  /* #region Get collections */

  private async _getCollections(locale: string): Promise<IShoplab.Collections> {
    this._logger.debug(`Fetching collections for locale "${locale}"`);

    try {
      const language = this._config.getLanguage(locale);
      const storefrontId = this.getStorefrontIdByLocale(locale);

      const { data } = await this.fetch<IShoplabApi.Collections>(storefrontId, `collections`);

      const result: IShoplab.Collections = new Map<string, IShoplab.Collection>();

      data.forEach((collection) => {
        const { id, title, full_slug, attributes } = collection;

        result.set(full_slug, {
          id,

          fullSlug: full_slug,
          slugList: this.getSlugListByFullSlug(full_slug),

          title: title,
          description: this.getByLocale(attributes.CollectionDescription.value, language),

          meta: {
            title: this.getByLocale(attributes.collectionMetaTitle.value, language),
            description: this.getByLocale(attributes.collectionMetaDescription.value, language),
          },
        });
      });

      return result;
    } catch (e) {
      this._logger.error(`Error fetching collections for locale "${locale}"`, e);
      throw e;
    }
  }

  /* #endregion */

  /* #region Get collection by slug */

  private async _getCollectionBySlug(locale: string, slug: string): Promise<IShoplab.Collection | null> {
    try {
      const collections = await this.getCollections(locale);

      if (!collections.has(slug)) throw new Error('Collection not found');

      return collections.get(slug)!;
    } catch (e) {
      this._logger.error(`Error fetching collection for locale "${locale}" and slug "${slug}"`, e);
      return null;
    }
  }

  /* #endregion */

  /* #region Get navigation */

  private async _getNavigation(locale: string): Promise<IShoplab.Navigation> {
    const shoplabId = this.getStorefrontIdByLocale(locale);
    try {
      const { data: navigation } = await this.fetch<IShoplabApi.Navigation>(shoplabId, `navigations/${shoplabId}`);

      const getChildrenArray = (navigation: Record<string, IShoplabApi.NavigationItem>): IShoplab.NavigationItem[] =>
        Object.values(navigation).map((child) => ({
          id: child.id ?? '',
          title: child.label ?? '',
          url: child.url ?? '',
          type: child.type ?? '',
          children: Array.isArray(child.children) ? [] : (getChildrenArray(child.children) ?? []),
        }));

      if (!navigation?.items) {
        return [];
      }

      if (Object.keys(navigation.items).length === 0) {
        return [];
      }

      return getChildrenArray(navigation.items);
    } catch (e) {
      this._logger.error(`Error fetching navigation for locale "${locale}"`, e);
      return [];
    }
  }
  public async _getNewPayloadNavigation(locale?: string): Promise<IShoplab.NewNavigation> {
    const marketCode = locale ?? 'sv';
    try {
      const response = await fetch(`${this.payloadbaseUrl}/api/side-nav?where[marketCode][equals]=${marketCode}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this._logger.error(`Error fetching navigation for locale "${locale}"`);
        return [];
      }

      const data: IShoplab.NewNavigationItem = await response.json();
      return data.docs as IShoplab.NewNavigation;
    } catch (e) {
      this._logger.error(`Error fetching navigation for locale "${locale}"`, e);
      return [];
    }
  }

  /* #endregion */

  /* #region Get products sitemap */

  private async _getSitemapProducts(locale: string): Promise<IShoplab.SitemapProducts> {
    const shoplabId = this.getStorefrontIdByLocale(locale);

    try {
      const { data: products } = await this.fetch<IShoplabApi.SitemapProducts>(shoplabId, `sitemap/products`);

      // Ensure products is an array
      if (!products || !Array.isArray(products)) {
        console.warn(`Products data is not an array for locale ${locale}`, products);
        return [];
      }

      return products.map((child) => ({
        id: child?.id ?? undefined,
        slug: child?.slug ?? '',
        lastModified: child?.lastModified ?? '',
      }));
    } catch (error) {
      console.error(`Error fetching sitemap products for locale ${locale}:`, error);
      return [];
    }
  }

  /* #endregion */

  /* #region Get sitemap collections */

  private async _getSitemapCollections(locale: string): Promise<IShoplab.SitemapCollections> {
    const shoplabId = this.getStorefrontIdByLocale(locale);

    try {
      const { data: collections } = await this.fetch<IShoplabApi.SitemapCollections>(shoplabId, `sitemap/collections`);

      // Ensure collections is an array
      if (!collections || !Array.isArray(collections)) {
        console.warn(`Collections data is not an array for locale ${locale}`, collections);
        return [];
      }

      return collections.map((child) => ({
        id: child?.id ?? undefined,
        slug: child?.slug ?? '',
        lastModified: child?.lastModified ?? '',
      }));
    } catch (error) {
      console.error(`Error fetching sitemap collections for locale ${locale}:`, error);
      return [];
    }
  }

  /* #endregion */

  /* #region Internals */

  protected getStorefrontIdByLocale(locale: string): number {
    const marketCode = getMarketCode(locale);

    const foundShoplabId = this._config.Search.Markets.find((market) => market.code === marketCode)?.shoplabId;
    if (foundShoplabId) return foundShoplabId;

    this._logger.error(`Failed to get storefront id for locale "${locale}"`);
    throw new Error(`Failed to get storefront id for locale "${locale}"`);
  }

  protected async fetch<T>(storefrontId: string | number, url: string): Promise<T> {
    const response = await fetch(`${this._config.Shoplab.ApiUrl}/storefronts/${storefrontId}/${url}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.Shoplab.ApiKey}`,
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      this._logger.error(
        `API request failed with status ${response.status} for URL: storefronts/${storefrontId}/${url}`,
      );
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      this._logger.error(`Expected JSON response but got ${contentType} for URL: storefronts/${storefrontId}/${url}`);
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      this._logger.error(`Failed to parse JSON response for URL: storefronts/${storefrontId}/${url}`, error);
      throw error;
    }
  }

  protected readonly getSlugListByFullSlug = (fullSlug: string): string[] =>
    compact(fullSlug.replace(/^\//g, '').split('/'));

  protected readonly getByLocale = (
    value: Record<string, string> | null,
    language: string | undefined,
    defaultLanguage: string = 'sv',
  ): string => (value ? (value[language ?? defaultLanguage] ?? value[defaultLanguage] ?? '') : '');

  /* #endregion */
}
