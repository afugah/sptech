'use client';

import { ProductGrid } from '@/src/components/product/ProductGrid';
import { useSearchProduct } from '@/src/components/search/dropdown-search/components/useSearchProduct';
import { Pagination, PaginationAlign } from '@/src/components/ui/Pagination';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { FilterGrid } from './ProductFilters';

interface ISearchProductLoaderProps {
  searchParams: { q: string; page?: string };
  defaultFilters: ICollectionSearch.Filter;
  facets: ICollectionSearch.Facets;
  defaultSort: ICollectionSearch.Sort;
}

export const SearchProductLoader: React.FC<ISearchProductLoaderProps> = (props) => {
  const { searchParams, defaultFilters, facets, defaultSort } = props;
  const { page = '1', q } = searchParams;

  const initialPage = parseInt(page, 10);

  const {
    sort,
    isLoading,
    productList,
    totalItems,
    currentPage,
    totalPages,
    onFiltersChange,
    onSortChange,
    onPageChange,
    shownItemsCount,
  } = useSearchProduct({
    q,
    defaultSort,
    defaultFilters,
    initialPage,
  });

  return (
    <>
      <FilterGrid
        facets={facets}
        productList={productList}
        total={totalItems}
        onFiltersChange={onFiltersChange}
        onSortChange={onSortChange}
        defaultFilters={defaultFilters}
        defaultSort={sort}
        queryString={q}
        showSearchFilter={true}
      />

      <div className={'container mx-auto'}>
        <ProductGrid isLoading={isLoading} productList={productList} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          siblingCount={0}
          align={PaginationAlign.Center}
          className={'mt-12 flex flex-col items-center justify-center'}
          onPageChange={onPageChange}
          shownItems={shownItemsCount}
          allItems={totalItems}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};
