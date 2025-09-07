import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';

abstract class FindifyQueryBuilderBase<T extends IFindify.QueryBody | IFindify.FeaturedQueryBody> {
  protected abstract _body: T;

  public withPagination = (
    pagination: ICollectionSearch.Pagination = {
      page: 0,
      take: 24,
    },
  ): this => {
    const { page = 0, take = 24 } = pagination;

    this._body.offset = page * take;
    this._body.limit = take;

    return this;
  };

  public build(): T {
    return this._body;
  }
}

export class FindifyQueryBuilder extends FindifyQueryBuilderBase<IFindify.QueryBody> {
  protected _body: IFindify.QueryBody = {
    filters: [],
  };

  public withQuery(q: string | undefined): this {
    if (q?.trim()) this._body.q = q;

    return this;
  }

  public withSort(sort?: ICollectionSearch.Sort[]): this {
    const filteredSort = sort?.filter((s) => !!s.field && !!s.order);
    if (!filteredSort?.length) return this;

    const sortField = filteredSort.map((s) => ({ field: s.field, order: s.order }));
    this._body.sort = sortField;

    return this;
  }

  public withInactive(includeInactive: boolean | undefined): this {
    if (!includeInactive)
      this._body.filters = [
        {
          name: 'availability',
          type: 'boolean',
          values: [{ value: 'true' }],
        },
        ...this._body.filters,
      ];

    return this;
  }

  public withFilters = (filter?: ICollectionSearch.Filter): this => {
    if (!filter) return this;

    const { brand, color, size, price, category } = filter;

    if (brand?.length)
      this._body.filters.push({
        name: 'brand',
        type: 'text',
        values: brand.map((value) => ({ value })),
      });
    if (category?.length)
      this._body.filters.push({
        name: 'category1',
        type: 'category',
        values: category.map((value) => ({ value })),
      });

    if (color?.length)
      this._body.filters.push({
        name: 'color',
        type: 'text',
        values: color.map((value) => ({ value })),
      });

    if (size?.length)
      this._body.filters.push({
        name: 'size',
        type: 'text',
        values: size.map((value) => ({ value: value.toString() })),
      });

    if (price?.min || price?.max)
      this._body.filters.push({
        name: 'price',
        type: 'range',
        values: [
          {
            from: price.min,
            to: price.max,
          },
        ],
      });

    return this;
  };
}

export class FindifyFeaturedQueryBuilder extends FindifyQueryBuilderBase<IFindify.FeaturedQueryBody> {
  protected _body: IFindify.FeaturedQueryBody = {};

  public withProductReference(itemId?: string | string[]) {
    if (!itemId) return this;

    if (Array.isArray(itemId)) this._body.item_ids = itemId;
    else this._body.item_id = itemId;

    return this;
  }
}
