import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

export namespace ICollectionResponse {
  export interface Pagination {
    total: {
      items: number;
      pages: number;
    };

    page: number;
    take: number;

    hasMore: boolean;
  }

  export interface Success {
    items: ICollectionItem[];

    slug?: string;

    pagination: Pagination;
  }

  export type Generic = Success;
}
