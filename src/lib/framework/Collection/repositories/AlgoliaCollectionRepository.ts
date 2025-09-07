// TODO: Remove when implemented
/* eslint-disable unused-imports/no-unused-vars */

import { inject, singleton } from 'tsyringe';
import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { AlgoliaCollectionItemMapper } from '@/src/lib/framework/Collection/repositories/mappers/AlgoliaCollectionItemMapper';
import { type IAlgolia } from '@/src/lib/framework/Collection/types/IAlgolia';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';

@singleton()
export class AlgoliaCollectionRepository implements ICollectionRepository {
  public constructor(
    @injectLogger('AlgoliaCollectionRepository') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
  ) {}

  public getFacetsBySlugOrQuery = async (marketCode: string, slug: string): Promise<ICollectionSearch.Facets> => {
    // TODO: Not implemented
    this._logger.warn('`getFacets` method is not implemented!');
    return [];
  };

  public getItemsBySlug = async (
    marketCode: string,
    slug: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => this.getItems(marketCode, { slug, filter }, sort, pagination);

  public getItems = async (
    marketCode: string,
    filters?: ICollectionSearch.Filters,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    const body: IAlgolia.QueryBody = {
      attributesToRetrieve: this.baseAttributes,
      query: filters?.query,
    };

    if (!filters?.includeInactive) {
      body.facets = ['status', ...(body.facets ?? [])];
      body.facetFilters = [`status:ACTIVE`, ...(body.facetFilters ?? [])];
    }

    if (filters?.slug?.trim()?.length) {
      body.facets = [...(body.facets ?? []), 'collection_page_slugs'];
      body.facetFilters = [...(body.facetFilters ?? []), `collection_page_slugs:/${filters.slug}`];
    }

    if (filters?.filter) {
      // TODO: Not implemented
      this._logger.warn('Not implemented!');
    }
    if (sort) {
      // TODO: Not implemented
      this._logger.warn('Not implemented!');
    }

    if (pagination) {
      body.page = pagination.page;
      body.hitsPerPage = pagination.take;
    }

    const result = await this.fetch<IAlgolia.SearchResponse>(marketCode, body);

    return this.resultToResponse(result, filters?.slug);
  };

  public getRecommendedItems = (
    marketCode: string,
    slot: string,
    itemId?: string | string[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    throw new Error('Not implemented');
  };

  public getByName = (
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    // TODO: Implement
    throw new Error('Not implemented');
  };

  public getItemsByQuery = (
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    throw new Error('Not implemented');
  };

  public getRecommendation = (marketCode: string, q: string): Promise<ICollectionResponse.Generic> => {
    throw new Error('Not implemented');
  };

  public searchByName = (
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    throw new Error('Not implemented');
  };

  public getSearchAutocomplete = (marketCode: string, q: string): Promise<ICollectionResponse.Generic> => {
    throw new Error('Not implemented');
  };

  public postFeedback = async (
    marketCode: string,
    event: FeedbackEvent,
    properties: FeedbackBody<FeedbackEvent>['properties'],
  ): Promise<{ status: number; message: string } | null> => {
    throw new Error('Not implemented');
  };

  // #region Internals

  protected readonly resultToResponse = (
    result: IAlgolia.SearchResponse,
    slug?: string,
  ): ICollectionResponse.Generic => ({
    items: result.hits.map(AlgoliaCollectionItemMapper.FromAlgolia),

    slug: slug,

    pagination: {
      total: {
        items: result.nbHits,
        pages: result.nbPages,
      },

      page: result.page,
      take: result.hitsPerPage,

      hasMore: result.nbPages - result.page > 0,
    },
  });

  protected readonly baseAttributes: IAlgolia.BaseAttribute[] = [
    'product_sku',
    'title',
    'status',
    'media',
    'attr_item_category',
    'attr_color',
    'stock',
    'regular_price',
    'sale_price',
    'slug',
  ];

  protected readonly detailedAttributes: IAlgolia.DetailedAttribute[] = [
    'description',
    'attr_height',
    'attr_length',
    'attr_width',
    'variants',
  ];

  protected readonly fetch = async <T extends IAlgolia.GenericResponse>(
    marketCode: string,
    { attributesToRetrieve, attributesToHighlight = [], ...body }: IAlgolia.QueryBody,
  ): Promise<T> => {
    if (!this._config.Search.Findify.has(marketCode)) throw new Error(`Market code ${marketCode} not found`);
    const { ApiUrl, ApiKey, AppId, IndexName } = this._config.Search.Algolia.get(marketCode)!;

    const result = await fetch(`${ApiUrl}/1/indexes/${IndexName}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query: '',
        page: 0,
        attributesToRetrieve,
        attributesToHighlight,
        ...body,
      }),
      headers: {
        'X-Algolia-API-Key': ApiKey,
        'X-Algolia-Application-Id': AppId,
      },
    });

    return (await result.json()) as T;
  };

  // #endregion
}
