import { unstable_cache } from 'next/cache';
import { inject, singleton } from 'tsyringe';
import { Client as TypesenseClient } from 'typesense';
import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { TypesenseCollectionMapper } from '@/src/lib/framework/Collection/repositories/mappers/TypesenseCollectionMapper';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';

@singleton()
export class TypesenseCollectionRepository implements ICollectionRepository {
  private readonly client: TypesenseClient;

  public constructor(
    @injectLogger('TypesenseCollectionRepository') private readonly _logger: LoggerService,
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

  public getItemsByQuery = unstable_cache(
    async (
      marketCode: string,
      q: string,
      filter?: ICollectionSearch.Filter,
      sort?: ICollectionSearch.Sort[],
      pagination?: ICollectionSearch.Pagination,
    ): Promise<ICollectionResponse.Generic> => this._getItemsByQuery(marketCode, q, filter, sort, pagination),
    ['TypesenseCollectionRepository.getItemsByQuery'],
    { tags: ['TypesenseCollectionRepository.getItemsByQuery'] },
  );

  public getFacetsBySlugOrQuery = unstable_cache(
    async (marketCode: string, slugOrQuery: string, isQuery?: boolean): Promise<ICollectionSearch.Facets> =>
      this._getFacetsBySlugOrQuery(marketCode, slugOrQuery, isQuery),
    ['TypesenseCollectionRepository.getFacetsBySlugOrQuery'],
    { tags: ['TypesenseCollectionRepository.getFacetsBySlugOrQuery'] },
  );

  public getSearchAutocomplete = unstable_cache(
    async (marketCode: string, q: string): Promise<ICollectionResponse.Generic> =>
      this._getSearchAutocomplete(marketCode, q),
    ['TypesenseCollectionRepository.getSearchAutocomplete'],
    { tags: ['TypesenseCollectionRepository.getSearchAutocomplete'] },
  );

  public getItemsBySlug = unstable_cache(
    async (
      marketCode: string,
      slug: string,
      filter?: ICollectionSearch.Filter,
      sort?: ICollectionSearch.Sort[],
      pagination?: ICollectionSearch.Pagination,
    ): Promise<ICollectionResponse.Generic> => this._getItemsBySlug(marketCode, slug, filter, sort, pagination),
    ['TypesenseCollectionRepository.getItemsBySlug'],
    { tags: ['TypesenseCollectionRepository.getItemsBySlug'] },
  );

  public getItems = unstable_cache(
    async (
      marketCode: string,
      filters?: ICollectionSearch.Filters,
      sort?: ICollectionSearch.Sort[],
      pagination?: ICollectionSearch.Pagination,
    ): Promise<ICollectionResponse.Generic> => this._getItems(marketCode, filters, sort, pagination),
    ['TypesenseCollectionRepository.getItems'],
    { tags: ['TypesenseCollectionRepository.getItems'] },
  );

  public getRecommendedItems = unstable_cache(
    async (
      marketCode: string,
      slot: string,
      itemId?: string | string[],
      pagination?: ICollectionSearch.Pagination,
    ): Promise<ICollectionResponse.Generic> => this._getRecommendedItems(marketCode, slot, itemId, pagination),
    ['TypesenseCollectionRepository.getRecommendedItems'],
    { tags: ['TypesenseCollectionRepository.getRecommendedItems'] },
  );

  private async _getItemsByQuery(
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> {
    try {
      const searchParams: Record<string, unknown> = {
        q: q || '*',
        query_by: 'title,description,product_sku,search_keywords',
        filter_by: this.buildFilterBy(filter, marketCode),
        sort_by: this.buildSortBy(sort),
        facet_by: 'facet_category,facet_collection,facet_color,facet_material',
        page: pagination?.page || 1,
        per_page: pagination?.take || 24,
        max_facet_values: 100,
        prioritize_exact_match: true,
        num_typos: 2,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToCollectionResponse(searchResults, marketCode);
    } catch (error) {
      this._logger.error('Typesense query search error:', error);
      throw error;
    }
  }

  private async _getFacetsBySlugOrQuery(
    marketCode: string,
    slugOrQuery: string,
    isQuery?: boolean,
  ): Promise<ICollectionSearch.Facets> {
    try {
      const searchParams: Record<string, unknown> = {
        q: isQuery ? slugOrQuery : '*',
        query_by: isQuery ? 'title,description,search_keywords' : 'slug,fullSlug',
        filter_by: isQuery
          ? this.buildFilterBy(undefined, marketCode)
          : `status:ACTIVE && ${this.buildMarketFilter(marketCode)} && slug:${slugOrQuery}`,
        facet_by: 'facet_category,facet_collection,facet_color,facet_material',
        per_page: 0, // Only get facets, no results
        max_facet_values: 100,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToFacets(searchResults.facet_counts || []);
    } catch (error) {
      this._logger.error('Typesense facets search error:', error);
      throw error;
    }
  }

  private async _getSearchAutocomplete(marketCode: string, q: string): Promise<ICollectionResponse.Generic> {
    try {
      const searchParams: Record<string, unknown> = {
        q,
        query_by: 'title,product_sku',
        filter_by: this.buildFilterBy(undefined, marketCode),
        per_page: 10,
        prefix: true,
        prioritize_exact_match: true,
        num_typos: 1,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToCollectionResponse(searchResults, marketCode);
    } catch (error) {
      this._logger.error('Typesense autocomplete search error:', error);
      throw error;
    }
  }

  private async _getItemsBySlug(
    marketCode: string,
    slug: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> {
    try {
      const searchParams: Record<string, unknown> = {
        q: '*',
        query_by: 'title,description',
        filter_by: this.buildFilterBy(filter, marketCode, `slug:${slug}`),
        sort_by: this.buildSortBy(sort),
        facet_by: 'facet_category,facet_collection,facet_color,facet_material',
        page: pagination?.page || 1,
        per_page: pagination?.take || 24,
        max_facet_values: 100,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToCollectionResponse(searchResults, marketCode);
    } catch (error) {
      this._logger.error('Typesense slug search error:', error);
      throw error;
    }
  }

  private async _getItems(
    marketCode: string,
    filters?: ICollectionSearch.Filters,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> {
    try {
      const searchParams: Record<string, unknown> = {
        q: '*',
        query_by: 'title,description',
        filter_by: this.buildFilterBy(filters, marketCode),
        sort_by: this.buildSortBy(sort),
        facet_by: 'facet_category,facet_collection,facet_color,facet_material',
        page: pagination?.page || 1,
        per_page: pagination?.take || 24,
        max_facet_values: 100,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToCollectionResponse(searchResults, marketCode);
    } catch (error) {
      this._logger.error('Typesense items search error:', error);
      throw error;
    }
  }

  private async _getRecommendedItems(
    marketCode: string,
    slot: string,
    itemId?: string | string[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> {
    // For now, return similar products based on category/collection
    // This can be enhanced with ML recommendations later
    try {
      let filter = this.buildMarketFilter(marketCode);

      if (itemId) {
        // Get similar items by excluding current item and finding similar category/collection
        const ids = Array.isArray(itemId) ? itemId : [itemId];
        filter += ` && !id:[${ids.join(',')}]`;
      }

      const searchParams: Record<string, unknown> = {
        q: '*',
        query_by: 'title,description',
        filter_by: filter,
        sort_by: 'updated_at:desc',
        page: pagination?.page || 1,
        per_page: pagination?.take || 12,
      };

      const searchResults = await this.client
        .collections(this._config.Search.Typesense.Collection)
        .documents()
        .search(searchParams);

      return TypesenseCollectionMapper.ToCollectionResponse(searchResults, marketCode);
    } catch (error) {
      this._logger.error('Typesense recommendations search error:', error);
      throw error;
    }
  }

  public async postFeedback(
    marketCode: string,
    event: FeedbackEvent,
    properties: FeedbackBody<FeedbackEvent>['properties'],
  ): Promise<{ status: number; message: string } | null> {
    // Typesense doesn't have built-in analytics like Findify
    // This could be implemented with external analytics service
    this._logger.info('Feedback received:', { marketCode, event, properties });
    return { status: 200, message: 'Feedback logged' };
  }

  private buildFilterBy(
    filter?: ICollectionSearch.Filter | ICollectionSearch.Filters,
    marketCode?: string,
    additionalFilter?: string,
  ): string {
    const filters: string[] = [];

    // Always include basic filters
    filters.push('status:ACTIVE');

    if (marketCode) {
      filters.push(this.buildMarketFilter(marketCode));
    }

    // Add additional filter if provided
    if (additionalFilter) {
      filters.push(additionalFilter);
    }

    // Process filter object
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            filters.push(`${key}:[${value.join(',')}]`);
          }
        } else if (value !== undefined && value !== null) {
          filters.push(`${key}:${value}`);
        }
      });
    }

    return filters.join(' && ');
  }

  private buildMarketFilter(marketCode: string): string {
    // Filter out products excluded for this market
    return `!marketsExclude:${marketCode}`;
  }

  private buildSortBy(sort?: ICollectionSearch.Sort[]): string | undefined {
    if (!sort || sort.length === 0) {
      return 'updated_at:desc'; // Default sort
    }

    return sort.map((s) => `${s.field}:${s.order}`).join(',');
  }
}
