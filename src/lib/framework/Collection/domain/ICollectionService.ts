import { type FeedbackBody, type FeedbackEvent } from '@/src/context/findifyAnalytics/types';
import { type ICollectionResponse } from '@/src/lib/framework/Collection/types/ICollectionResponse';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

export interface ICollectionService {
  getItemsByQuery: (
    marketCode: string,
    q: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ) => Promise<ICollectionResponse.Generic>;

  getFacetsBySlugOrQuery: (
    marketCode: string,
    slugOrQuery: string,
    isQuery?: boolean,
  ) => Promise<ICollectionSearch.Facets>;

  getSearchAutocomplete: (marketCode: string, q: string) => Promise<ICollectionResponse.Generic>;

  getItemsBySlug: (
    marketCode: string,
    slug: string,
    filter?: ICollectionSearch.Filter,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ) => Promise<ICollectionResponse.Generic>;

  getItems: (
    marketCode: string,
    filters?: ICollectionSearch.Filters,
    sort?: ICollectionSearch.Sort[],
    pagination?: ICollectionSearch.Pagination,
  ) => Promise<ICollectionResponse.Generic>;

  getRecommendedItems: (
    marketCode: string,
    slot: string,
    itemId?: string | string[],
    pagination?: ICollectionSearch.Pagination,
  ) => Promise<ICollectionResponse.Generic>;

  postFeedback: (
    marketCode: string,
    event: FeedbackEvent,
    properties: FeedbackBody<FeedbackEvent>['properties'],
  ) => Promise<{ status: number; message: string } | null>;
}
