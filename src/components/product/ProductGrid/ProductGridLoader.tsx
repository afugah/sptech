'use client';

import { ProductGrid } from '@/src/components/product/ProductGrid';
import { FilterGrid } from '@/src/components/search/dropdown-search/components/ProductFilters';
import { Pagination, PaginationAlign } from '@/src/components/ui/Pagination';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { useProductGrid } from './useProductGrid';

interface IProductGridLoaderProps {
  searchParams: { page?: string };
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
  facets: ICollectionSearch.Facets;
  slug: string;
  useViewMore?: boolean;
  showSearchFilter?: boolean;
}

export const ProductGridLoader: React.FC<IProductGridLoaderProps> = (props) => {
  const {
    searchParams,
    defaultFilters,
    defaultSort,
    facets,
    slug,
    useViewMore = false,
    showSearchFilter = true,
  } = props;
  const { page = '1' } = searchParams;
  const initialPage = parseInt(page, 10);

  const {
    sort,
    productList,
    totalItems,
    currentPage,
    totalPages,
    onFiltersChange,
    onSortChange,
    onPageChange,
    isLoading,
    shownItemsCount,
  } = useProductGrid({
    slug,
    defaultSort,
    defaultFilters,
    initialPage,
    useViewMore,
  });
  return (
    <>
      <FilterGrid
        defaultSort={sort}
        productList={productList}
        total={totalItems}
        facets={facets}
        defaultFilters={defaultFilters}
        onSortChange={onSortChange}
        onFiltersChange={onFiltersChange}
        queryString={''}
        showSearchFilter={showSearchFilter}
      />

      <ProductGrid productList={productList} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        siblingCount={0}
        align={PaginationAlign.Center}
        className={'mt-12 flex flex-col items-center justify-center'}
        onPageChange={onPageChange}
        shownItems={useViewMore ? shownItemsCount : productList.length}
        allItems={totalItems}
        useViewMore={useViewMore}
        isLoading={isLoading}
      />
    </>
  );
};
