import { unstable_cache } from 'next/cache';
import { inject, singleton } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductRepository } from '@/src/lib/framework/Product/domain/IProductRepository';
import { ElasticSearchProductMapper } from '@/src/lib/framework/Product/repositories/mappers/ElasticSearchProductMapper';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';

@singleton()
export class ElasticSearchRepository implements IProductRepository {
  public constructor(
    @injectLogger('ElasticSearchRepository') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
  ) {}

  public getItemBySlug = unstable_cache(
    async (locale: string, slug: string): Promise<IProduct> => this._getItemBySlug(locale, slug),
    ['ElasticSearchRepository.getItemBySlug'],
    { tags: ['ElasticSearchRepository.getItemBySlug'] },
  );

  public getItemByID = unstable_cache(
    async (locale: string, id: string): Promise<IProduct> => this._getItemByID(locale, id),
    ['ElasticSearchRepository.getItemByID'],
    { tags: ['ElasticSearchRepository.getItemByID'] },
  );

  public getWarehouses = unstable_cache(
    async (): Promise<IElasticSearch.WareHousesSuccessResponse> => this._getWarehouses(),
    ['ElasticSearchRepository.getWarehouses'],
    { tags: ['ElasticSearchRepository.getWarehouses'] },
  );

  private async _getWarehouses(): Promise<IElasticSearch.WareHousesSuccessResponse> {
    const { ApiWarehouseUrl, ApiKey } = this._config.Search.ElasticSearch;
    const result = await fetch(`${ApiWarehouseUrl}?size=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `apiKey ${ApiKey}`,
      },
    });
    const data = await result.json();
    return data as IElasticSearch.WareHousesSuccessResponse;
  }

  private async _getItemBySlug(locale: string, slug: string): Promise<IProduct> {
    const language = this._config.getLanguage(locale);
    if (!language) {
      throw new Error(`Language not found for locale: ${locale}`);
    }
    const data = await this.fetch({ params: { fullSlug: `${slug.replaceAll('//', '/')}` } });

    const hit = data.hits.hits.find(
      (hit) => hit._source.status === 'ACTIVE' && hit._source.fullSlug[language] === slug.replaceAll('//', '/'),
    );

    if (!hit) {
      // Throw a properly serializable error for RSC
      const error = new Error(`Product not found for slug: ${slug}`);
      error.name = 'NotFoundError';
      throw error;
    }

    const item = ElasticSearchProductMapper.FromElastic(
      hit._source,
      language,
      this._config.Search.ElasticSearch.Language,
    );

    this._logger.debug(`Found item for locale "${locale}" with Id:`, item.id);

    return item;
  }

  private async _getItemByID(locale: string, id: string): Promise<IProduct> {
    const data = await this.fetch({ params: { id: `${id}` } });

    const hit = data.hits.hits.find((hit) => hit._source.status === 'ACTIVE');
    if (!hit) {
      // Throw a properly serializable error for RSC
      const error = new Error(`Product not found for ID: ${id}`);
      error.name = 'NotFoundError';
      throw error;
    }

    const language = this._config.getLanguage(locale);
    if (!language) {
      throw new Error(`Language not found for locale: ${locale}`);
    }
    const item = ElasticSearchProductMapper.FromElastic(
      hit._source,
      language,
      this._config.Search.ElasticSearch.Language,
    );

    this._logger.debug(`Found item for locale "${locale}" with Id:`, item.id);

    return item;
  }

  protected async fetch(body: IElasticSearch.QueryBody): Promise<IElasticSearch.GenericResponse> {
    const { ApiUrl, ApiKey } = this._config.Search.ElasticSearch;
    const result = await fetch(`${ApiUrl}/_search`, {
      method: 'POST',
      body: JSON.stringify({
        ...body,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `apiKey ${ApiKey}`,
      },
    });

    if (!result.ok) {
      const errorText = await result.text();
      this._logger.error('ElasticSearch API error:', {
        status: result.status,
        statusText: result.statusText,
        error: errorText,
      });
      throw new Error(`ElasticSearch API error: ${result.status} ${result.statusText}`);
    }

    return (await result.json()) as IElasticSearch.GenericResponse;
  }
}
