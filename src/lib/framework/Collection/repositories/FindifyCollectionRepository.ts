import { cookies } from 'next/headers';
import { inject, singleton } from 'tsyringe';
import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { Tokens } from '@/src/lib/diTokens';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { FindifyCollectionItemMapper } from '@/src/lib/framework/Collection/repositories/mappers/FindifyCollectionItemMapper';
import {
  FindifyFeaturedQueryBuilder,
  FindifyQueryBuilder,
} from '@/src/lib/framework/Collection/shared/FindifyQueryBuilder';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IUserIdService } from '@/src/lib/framework/UserId/domain/IUserIdService';
import { UserIdService } from '@/src/lib/framework/UserId/services/UserIdService';
import { setCookie } from '@/src/lib/framework/UserId/shared/setCookieAction';

type IEndpoint = 'search' | `smart-collection/${string}` | `recommend/${string}` | 'autocomplete' | 'feedback';

@singleton()
export class FindifyCollectionRepository implements ICollectionRepository {
  public lastRequestId: string | undefined;

  public constructor(
    @injectLogger('FindifyCollectionRepository') private readonly _logger: LoggerService,
    @inject(Tokens.Configuration) private readonly _config: IConfiguration,
    @inject(UserIdService) private readonly _uidService: IUserIdService,
  ) {}

  public getFacetsBySlugOrQuery = async (
    marketCode: string,
    slugOrQuery: string,
    isQuery: boolean = false,
  ): Promise<ICollectionSearch.Facets> => {
    const bodyBuilder = new FindifyQueryBuilder().withFilters().withPagination({ page: 0, take: 1 });

    const result = isQuery
      ? await this.fetch(marketCode, bodyBuilder.withQuery(decodeURIComponent(slugOrQuery)).build(), `search`)
      : await this.fetch(marketCode, bodyBuilder.build(), `smart-collection/${slugOrQuery}`);

    if (!result || 'error' in result) {
      // If collection is not found, return empty facets without logging an error
      if (result?.error?.message?.includes('Smart collection') && result?.error?.message?.includes('not found')) {
        return [];
      }
      this._logger.error(`Error fetching facets for market "${marketCode}":`, result?.error?.message);
      return [];
    }

    return result.facets;
  };

  public getItemsBySlug = async (
    marketCode: string,
    slug: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> =>
    this.getItems(marketCode, { slug, filter }, sort, pagination, `smart-collection/${slug}`);

  public getItems = async (
    marketCode: string,
    filters?: ICollectionSearch.Filters,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
    endpoint?: IEndpoint,
  ): Promise<ICollectionResponse.Generic> => {
    const body = new FindifyQueryBuilder()
      .withQuery(filters?.query)
      .withSort(sort)
      .withInactive(filters?.includeInactive)
      .withFilters(filters?.filter)
      .withPagination(pagination)
      .build();

    const result = await this.fetch(marketCode, body, endpoint);

    if ('error' in result) {
      this._logger.error(`Error fetching items for market "${marketCode}":`, result?.error?.message);
      return {
        items: [],
        slug: filters?.slug,
        pagination: this.getPaginationResponse(result),
      };
    }

    return this.resultToResponse(result, filters?.slug);
  };

  public getRecommendedItems = async (
    marketCode: string,
    slot: string,
    itemId?: string | string[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    const body = new FindifyFeaturedQueryBuilder().withProductReference(itemId).withPagination(pagination).build();

    const result = await this.fetch(marketCode, body, `recommend/${slot}`);

    if ('error' in result) {
      this._logger.error(`Error fetching items for market "${marketCode}":`, result?.error?.message);
      return {
        items: [],
        pagination: this.getPaginationResponse(result),
      };
    }

    return this.resultToResponse(result);
  };

  public getItemsByQuery = async (
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ): Promise<ICollectionResponse.Generic> => {
    const body = new FindifyQueryBuilder()
      .withQuery(q)
      .withSort(sort)
      .withPagination(pagination)
      .withFilters(filter)
      .build();

    const result = await this.fetch(marketCode, body, `search`);

    if ('error' in result) {
      this._logger.error(`Error fetching items for market "${marketCode}":`, result?.error?.message);
      return {
        items: [],
        pagination: this.getPaginationResponse(result),
      };
    }

    return this.resultToResponse(result);
  };

  public getSearchAutocomplete = async (marketCode: string, q: string): Promise<ICollectionResponse.Generic> => {
    const body = new FindifyQueryBuilder().withQuery(q).build();

    const result = await this.fetch(marketCode, body, 'autocomplete');
    if ('error' in result) {
      this._logger.error(`Error fetching items for market "${marketCode}":`, result?.error?.message);
      return {
        items: [],
        pagination: this.getPaginationResponse(result),
      };
    }

    return this.resultToResponse(result);
  };

  public async postFeedback(
    marketCode: string,
    event: FeedbackEvent,
    properties: FeedbackBody<FeedbackEvent>['properties'],
  ): Promise<{ status: number; message: string } | null> {
    const rid = await this.getLastRequestId();
    if (!rid) return null;

    const body: FeedbackBody<FeedbackEvent> = {
      event,
      properties: { ...properties, rid },
    };

    const result = await this.fetch(marketCode, body, 'feedback').catch((error) => {
      this._logger.error(`Error posting feedbaccccck "${event}":`, error);
      return null;
    });

    if (!result) return null;

    return result;
  }

  /* #region Internals */

  protected fetch(
    marketCode: string,
    body: IFindify.QueryBody,
    endpoint?: IEndpoint,
  ): Promise<IFindify.GenericResponse>;
  protected fetch(
    marketCode: string,
    body: IFindify.FeaturedQueryBody,
    endpoint?: IEndpoint,
  ): Promise<IFindify.GenericResponse>;
  protected async fetch<T extends FeedbackEvent>(
    marketCode: string,
    body: FeedbackBody<T>,
    endpoint: IEndpoint,
  ): Promise<{ status: number; message: string }>;
  protected async fetch(
    marketCode: string,
    body: IFindify.QueryBody | IFindify.FeaturedQueryBody | FeedbackBody<FeedbackEvent>,
    endpoint: IEndpoint = 'search',
  ): Promise<IFindify.GenericResponse | { status: number; message: string }> {
    if (!this._config.Search.Findify.has(marketCode)) throw new Error(`Market code ${marketCode} not found`);
    const { ApiUrl, ApiKey } = this._config.Search.Findify.get(marketCode)!;

    // Try to get IDs directly from cookies first (prioritizing the values that work)
    let uid, sid;
    try {
      const cookieStore = await cookies();
      const findifyUid = cookieStore.get('findify_uid')?.value;
      const findifySid = cookieStore.get('findify_sid')?.value;

      // Use cookie values if available, otherwise fall back to UserIdService
      uid = findifyUid || this._uidService.uid;
      sid = findifySid || this._uidService.sid;
    } catch {
      // If cookies API fails (e.g., in middleware context), use UserIdService
      const { uid: serviceUid, sid: serviceSid } = this._uidService;
      uid = serviceUid;
      sid = serviceSid;
    }
    const base: Required<Pick<IFindify.QueryBody, 't_client' | 'user'>> = {
      t_client: new Date().getTime(),
      user: { uid, sid },
    };

    const result = await fetch(`${ApiUrl}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        ...base,
      }),
      headers: {
        'X-Key': ApiKey,
        'Content-Type': 'application/json',
      },
    });
    let jsonResponse = null;
    const responseText = await result.text();
    if (responseText) {
      try {
        jsonResponse = JSON.parse(responseText) as IFindify.GenericResponse;
        this.getRequestId(jsonResponse);
      } catch {
        throw new Error('Failed to parse response text');
      }
    } else {
      jsonResponse = { status: result.status, message: result.statusText };
    }
    return jsonResponse;
  }

  protected readonly resultToResponse = (
    result: IFindify.SuccessResponse,
    slug?: string,
  ): ICollectionResponse.Success => {
    return {
      items: result.items?.map((item) => FindifyCollectionItemMapper.FromFindify(item)) ?? [],

      slug: slug,

      pagination: this.getPaginationResponse(result),
    };
  };

  protected getRequestId(response: IFindify.GenericResponse): string | null {
    if ('meta' in response && response.meta?.rid) {
      const rid = response.meta.rid;
      this.lastRequestId = rid;
      setCookie('findifyLastRequestId', rid, { maxAge: 30 * 60 * 1000 });

      return rid;
    }
    return null;
  }

  public async getLastRequestId(): Promise<string | null> {
    if (this.lastRequestId) return this.lastRequestId;

    try {
      const cookieStore = await cookies();
      return cookieStore.get('findifyLastRequestId')?.value || null;
    } catch {
      return null;
    }
  }

  protected getPaginationResponse = (result: IFindify.GenericResponse): ICollectionResponse.Pagination => {
    if ('error' in result)
      return {
        total: {
          items: 0,
          pages: 0,
        },

        page: 0,
        take: 0,

        hasMore: false,
      };

    const { offset, limit: take, total } = result.meta;

    const totalPages = Math.ceil(total / take);
    const page = Math.round(offset / take);

    return {
      total: {
        items: total,
        pages: totalPages,
      },

      page,
      take,

      hasMore: Math.ceil(total / take) - Math.round(offset / take) - 1 > 0,
    };
  };

  /* #endregion */
}
