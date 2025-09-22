import { unstable_cache } from 'next/cache';
import { inject, singleton } from 'tsyringe';
import { Client as TypesenseClient } from 'typesense';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductRepository } from '@/src/lib/framework/Product/domain/IProductRepository';
import { TypesenseProductMapper } from '@/src/lib/framework/Product/repositories/mappers/TypesenseProductMapper';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { type ITypesense } from '@/src/lib/framework/Product/types/ITypesense';

@singleton()
export class TypesenseRepository implements IProductRepository {
  private readonly client: TypesenseClient;

  public constructor(
    @injectLogger('TypesenseRepository') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
  ) {
    // Initialize Typesense client
    this.client = new TypesenseClient({
      nodes: [
        {
          host: this._config.Search.Typesense.Host,
          port: this._config.Search.Typesense.Port,
          protocol: this._config.Search.Typesense.Protocol,
        },
      ],
      apiKey: this._config.Search.Typesense.ApiKey,
      connectionTimeoutSeconds: 2,
    });
  }

  public getItemBySlug = unstable_cache(
    async (locale: string, slug: string): Promise<IProduct> => this._getItemBySlug(locale, slug),
    ['TypesenseRepository.getItemBySlug'],
    { tags: ['TypesenseRepository.getItemBySlug'] },
  );

  public getItemByID = unstable_cache(
    async (locale: string, id: string): Promise<IProduct> => this._getItemByID(locale, id),
    ['TypesenseRepository.getItemByID'],
    { tags: ['TypesenseRepository.getItemByID'] },
  );

  private async _getItemBySlug(locale: string, slug: string): Promise<IProduct> {
    const language = this._config.getLanguage(locale);
    if (!language) {
      throw new Error(`Language not found for locale: ${locale}`);
    }

    try {
      // Extract ID from slug if it contains one (e.g., "battery-case-2-261" -> "261")
      const idMatch = slug.match(/-(\d+)$/);
      let searchParams: Record<string, unknown>;

      if (idMatch) {
        // Search by ID if we can extract it from the slug
        const id = idMatch[1];
        searchParams = {
          q: '*',
          query_by: 'title,sku', // Use fields that are definitely queryable
          filter_by: `id:${id}`,
          per_page: 1,
        };
      } else {
        // Fallback to searching by SKU or title
        // Remove any leading slashes and "products/" prefix
        const cleanSlug = slug.replace(/^\/+/, '').replace(/^products\//, '');
        searchParams = {
          q: cleanSlug,
          query_by: 'sku,title',
          per_page: 1,
        };
      }

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      if (!searchResults.hits?.length) {
        const error = new Error(`Product not found for slug: ${slug}`);
        error.name = 'NotFoundError';
        throw error;
      }

      const hit = searchResults.hits[0];
      // Generate marketKey from locale and language (e.g., "europe_SE")
      const marketKey = `europe_${locale.toUpperCase()}`;
      const product = TypesenseProductMapper.FromTypesense(
        hit.document as ITypesense.ProductDocument,
        language,
        marketKey,
      );

      this._logger.debug(`Found item for locale "${locale}" with slug: ${slug}`);

      return product;
    } catch (error) {
      this._logger.error('Typesense search error:', error);
      throw error;
    }
  }

  private async _getItemByID(locale: string, id: string): Promise<IProduct> {
    const language = this._config.getLanguage(locale);
    if (!language) {
      throw new Error(`Language not found for locale: ${locale}`);
    }

    try {
      const searchParams: Record<string, unknown> = {
        q: '*',
        query_by: 'title,sku', // Use fields that are definitely queryable
        filter_by: `id:${id}`,
        per_page: 1,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      if (!searchResults.hits?.length) {
        const error = new Error(`Product not found for ID: ${id}`);
        error.name = 'NotFoundError';
        throw error;
      }

      const hit = searchResults.hits[0];
      // Generate marketKey from locale and language (e.g., "europe_SE")
      const marketKey = `europe_${locale.toUpperCase()}`;
      const product = TypesenseProductMapper.FromTypesense(
        hit.document as ITypesense.ProductDocument,
        language,
        marketKey,
      );

      this._logger.debug(`Found item for locale "${locale}" with ID: ${id}`);

      return product;
    } catch (error) {
      this._logger.error('Typesense search error:', error);
      throw error;
    }
  }

  // Optional method for warehouse data - can be implemented later if needed
  public async getWarehouses(): Promise<IElasticSearch.WareHousesSuccessResponse> {
    throw new Error('Warehouse search not implemented for Typesense yet');
  }
}
