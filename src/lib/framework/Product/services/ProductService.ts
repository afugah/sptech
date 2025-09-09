import { inject, singleton } from 'tsyringe';
import { Tokens } from '@/src/lib/diTokens';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductRepository } from '@/src/lib/framework/Product/domain/IProductRepository';
import { type IProductService } from '@/src/lib/framework/Product/domain/IProductService';
import { type IReviewService } from '@/src/lib/framework/Reviews/domain/IReviewService';
import { ReviewService } from '@/src/lib/framework/Reviews/services/ReviewService';
import { getMarketCode } from '@/src/util/locale';

@singleton()
export class ProductService implements IProductService {
  public constructor(
    @injectLogger('ProductService') private readonly _logger: LoggerService,
    @inject(Tokens.ProductRepository) private readonly _item: IProductRepository,
    @inject(CommerceService) private readonly _commerceService: CommerceService,
    @inject(ReviewService) private readonly _reviewsService: IReviewService,
  ) {}

  public async getItemBySlug(locale: string, slug: string): Promise<IProduct> {
    try {
      const item = await this._item.getItemBySlug(locale, `/${slug}`);
      const hydratedItem = await this.hydrateItem(locale, item);

      return hydratedItem;
    } catch (err) {
      this._logger.info(`Error fetching item by slug "${slug}" for locale "${locale}"`);
      // Check if this is a 404 response from ElasticSearch or other APIs
      if (typeof err === 'string' && err.includes('"status":404')) {
        // Create a proper error object instead of using the string directly
        throw new Error(`Product not found: ${slug}`);
      }
      // Ensure error is serializable for RSC
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error(typeof err === 'string' ? err : 'Product fetch failed');
    }
  }
  public async getItemByID(locale: string, id: string): Promise<IProduct> {
    try {
      const item = await this._item.getItemByID(locale, id);
      const hydratedItem = await this.hydrateItem(locale, item);

      return hydratedItem;
    } catch (err) {
      this._logger.info(`Error fetching item by id "${id}" for locale "${locale}"`, err);
      // Ensure error is serializable for RSC
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error(typeof err === 'string' ? err : 'Product fetch by ID failed');
    }
  }

  protected async hydrateItem(locale: string, item: IProduct): Promise<IProduct> {
    const marketCode = getMarketCode(locale);
    // Map market codes to actual Brink country codes
    // Brink expects ISO 3166-1 alpha-2 country codes
    const countryCodeMap: Record<string, string> = {
      sv: 'SE', // Swedish market uses SE country code
      en: 'US', // English market uses US country code
      fi: 'FI', // Finnish market uses FI country code
      no: 'NO', // Norwegian market uses NO country code
      da: 'DK', // Danish market uses DK country code
      de: 'DE', // German market uses DE country code
      fr: 'FR', // French market uses FR country code
      es: 'ES', // Spanish market uses ES country code
      it: 'IT', // Italian market uses IT country code
      nl: 'NL', // Dutch market uses NL country code
      pt: 'PT', // Portuguese market uses PT country code
      pl: 'PL', // Polish market uses PL country code
    };
    const countryCode = countryCodeMap[marketCode.toLowerCase()] || 'US';

    try {
      const pricesPromise = this._commerceService.getPrice(item.brinkId, countryCode);
      const stockPromise = this._commerceService.getStock(item.brinkId, countryCode);

      const [pricesResult, stockResult] = await Promise.allSettled([pricesPromise, stockPromise]);

      const prices = pricesResult.status === 'fulfilled' ? pricesResult.value : [];
      const stock = stockResult.status === 'fulfilled' ? stockResult.value : [];

      if (pricesResult.status === 'rejected') {
        this._logger.error('Failed to fetch prices:', pricesResult.reason);
      }
      if (stockResult.status === 'rejected') {
        this._logger.error('Failed to fetch stock:', stockResult.reason);
      }

      const sortedMaterials = item.attributes.materials
        ?.split(',')
        .map((material) => {
          const match = material.match(/(\d+)%/);
          return match ? { percentage: parseInt(match[1], 10), text: material.trim() } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b!.percentage - a!.percentage)
        .map((item) => item!.text)
        .join(', ');

      return {
        ...item,
        attributes: {
          ...item.attributes,
          materials: sortedMaterials,
        },
        variants: item.variants.map((variant) => ({
          ...variant,
          price: prices.find((p) => p.id === variant.sku),
          stock: stock.find((s) => s.id === variant.sku),
        })),
      };
    } catch (err) {
      this._logger.error('Product hydration failed:', {
        countryCode,
        productId: item.id,
        error: err instanceof Error ? err.message : String(err),
      });

      // Return the item without prices and stock rather than failing completely
      return {
        ...item,
        attributes: {
          ...item.attributes,
          materials: item.attributes.materials,
        },
        variants: item.variants.map((variant) => ({
          ...variant,
          price: undefined,
          stock: undefined,
        })),
      };
    }
  }
}
