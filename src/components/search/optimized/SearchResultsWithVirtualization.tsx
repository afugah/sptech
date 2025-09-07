'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import VirtualizedProductGrid from '../../product/optimized/VirtualizedProductGrid';
import { useOptimizedSearchProduct } from './useOptimizedSearchProduct';

interface SearchResultsProps {
  query: string;
  defaultFilters?: ICollectionSearch.Filter;
  defaultSort?: ICollectionSearch.Sort;
  initialPage?: number;
  // UI customization
  showSortOptions?: boolean;
  showFilterOptions?: boolean;
  showPagination?: boolean;
  enableInfiniteScroll?: boolean;
  className?: string;
}

interface FilterSectionProps {
  filters: ICollectionSearch.Filter;
  onFiltersChange: (filters?: ICollectionSearch.Filter) => void;
  isLoading: boolean;
}

interface SortSectionProps {
  sort: ICollectionSearch.Sort;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  isLoading: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = React.memo(({ filters, onFiltersChange, isLoading }) => {
  const _handleBrandChange = useCallback(
    (brands: string[]) => {
      onFiltersChange({ ...filters, brand: brands });
    },
    [filters, onFiltersChange],
  );

  const _handleCategoryChange = useCallback(
    (categories: string[]) => {
      onFiltersChange({ ...filters, category: categories });
    },
    [filters, onFiltersChange],
  );

  const _handleColorChange = useCallback(
    (colors: string[]) => {
      onFiltersChange({ ...filters, color: colors });
    },
    [filters, onFiltersChange],
  );

  const _handleSizeChange = useCallback(
    (sizes: string[]) => {
      onFiltersChange({ ...filters, size: sizes });
    },
    [filters, onFiltersChange],
  );

  const _handlePriceChange = useCallback(
    (priceRange: { min?: number; max?: number }) => {
      onFiltersChange({ ...filters, price: priceRange });
    },
    [filters, onFiltersChange],
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({
      brand: [],
      category: [],
      color: [],
      size: [],
      price: undefined,
    });
  }, [onFiltersChange]);

  return (
    <div className={'bg-gray-50 space-y-6 rounded-lg p-4'}>
      <div className={'flex items-center justify-between'}>
        <h3 className={'text-lg font-semibold text-gray-900'}>Filters</h3>
        <button
          onClick={clearFilters}
          disabled={isLoading}
          className={'text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50'}
        >
          Clear all
        </button>
      </div>

      {/* Brand Filter */}
      <div>
        <label className={'mb-2 block text-sm font-medium text-gray-700'}>Brand</label>
        <div className={'space-y-2'}>
          {/* Implement brand filter UI */}
          <p className={'text-sm text-gray-500'}>Brand filter UI implementation needed</p>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className={'mb-2 block text-sm font-medium text-gray-700'}>Category</label>
        <div className={'space-y-2'}>
          {/* Implement category filter UI */}
          <p className={'text-sm text-gray-500'}>Category filter UI implementation needed</p>
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <label className={'mb-2 block text-sm font-medium text-gray-700'}>Color</label>
        <div className={'flex flex-wrap gap-2'}>
          {/* Implement color filter UI */}
          <p className={'text-sm text-gray-500'}>Color filter UI implementation needed</p>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <label className={'mb-2 block text-sm font-medium text-gray-700'}>Size</label>
        <div className={'flex flex-wrap gap-2'}>
          {/* Implement size filter UI */}
          <p className={'text-sm text-gray-500'}>Size filter UI implementation needed</p>
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <label className={'mb-2 block text-sm font-medium text-gray-700'}>Price Range</label>
        <div className={'space-y-2'}>
          {/* Implement price range filter UI */}
          <p className={'text-sm text-gray-500'}>Price range filter UI implementation needed</p>
        </div>
      </div>
    </div>
  );
});

FilterSection.displayName = 'FilterSection';

const SortSection: React.FC<SortSectionProps> = React.memo(({ sort, onSortChange, isLoading }) => {
  const sortOptions = useMemo(
    () => [
      { field: 'relevance', order: 'desc' as const, label: 'Relevance' },
      { field: 'price', order: 'asc' as const, label: 'Price: Low to High' },
      { field: 'price', order: 'desc' as const, label: 'Price: High to Low' },
      { field: 'created_at', order: 'desc' as const, label: 'Newest' },
      { field: 'title', order: 'asc' as const, label: 'Name: A to Z' },
      { field: 'title', order: 'desc' as const, label: 'Name: Z to A' },
    ],
    [],
  );

  const _currentSortLabel = useMemo(() => {
    const option = sortOptions.find((option) => option.field === sort.field && option.order === sort.order);
    return option?.label || 'Relevance';
  }, [sort, sortOptions]);

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const [field, order] = event.target.value.split(':');
      onSortChange({
        field: field as ICollectionSearch.Sort['field'],
        order: order as ICollectionSearch.Sort['order'],
      });
    },
    [onSortChange],
  );

  return (
    <div className={'flex items-center gap-4'}>
      <label htmlFor={'sort-select'} className={'text-sm font-medium text-gray-700'}>
        Sort by:
      </label>
      <select
        id={'sort-select'}
        value={`${sort.field}:${sort.order}`}
        onChange={handleSortChange}
        disabled={isLoading}
        className={
          'focus:ring-indigo-500 focus:border-indigo-500 block w-48 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none disabled:opacity-50 sm:text-sm'
        }
      >
        {sortOptions.map((option) => (
          <option key={`${option.field}:${option.order}`} value={`${option.field}:${option.order}`}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

SortSection.displayName = 'SortSection';

export const SearchResultsWithVirtualization: React.FC<SearchResultsProps> = ({
  query,
  defaultFilters = {
    brand: [],
    category: [],
    color: [],
    size: [],
    price: undefined,
  },
  defaultSort = { field: 'relevance', order: 'desc' },
  initialPage = 1,
  showSortOptions = true,
  showFilterOptions = true,
  showPagination = true,
  enableInfiniteScroll = true,
  className = '',
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    sort,
    productList,
    totalItems,
    isLoading,
    isFetching,
    currentPage,
    totalPages,
    hasNextPage,
    onPageChange,
    onFiltersChange,
    onSortChange,
    loadNextPage,
    allProducts,
  } = useOptimizedSearchProduct({
    q: query,
    defaultFilters,
    defaultSort,
    initialPage,
    prefetchNextPage: true,
    debounceMs: 300,
  });

  // Use all products for infinite scroll, regular productList for pagination
  const displayProducts = enableInfiniteScroll ? allProducts : productList;

  const handleProductClick = useCallback((product: ICollectionItem) => {
    // Analytics tracking or other product click handling
    console.warn('Product clicked:', product.slug);
  }, []);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  return (
    <div className={`${className} space-y-6`}>
      {/* Header with results count and sort */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
        <div className={'flex items-center gap-4'}>
          <h2 className={'text-xl font-semibold text-gray-900'}>Search Results</h2>
          {query && <span className={'text-gray-500'}>for &quot;{query}&quot;</span>}
          <span className={'text-sm text-gray-500'}>
            ({totalItems} {totalItems === 1 ? 'result' : 'results'})
          </span>
        </div>

        <div className={'flex items-center gap-4'}>
          {/* Mobile filter toggle */}
          {showFilterOptions && (
            <button
              onClick={toggleMobileFilters}
              className={
                'hover:bg-gray-50 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 sm:hidden'
              }
            >
              Filters
            </button>
          )}

          {/* Sort options */}
          {showSortOptions && (
            <div className={'hidden sm:block'}>
              <SortSection sort={sort} onSortChange={onSortChange} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>

      <div className={'flex flex-col gap-6 lg:flex-row'}>
        {/* Filters sidebar */}
        {showFilterOptions && (
          <div className={`lg:w-64 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterSection filters={defaultFilters} onFiltersChange={onFiltersChange} isLoading={isLoading} />
          </div>
        )}

        {/* Main content */}
        <div className={'flex-1'}>
          {/* Mobile sort */}
          {showSortOptions && (
            <div className={'mb-4 sm:hidden'}>
              <SortSection sort={sort} onSortChange={onSortChange} isLoading={isLoading} />
            </div>
          )}

          {/* Loading state */}
          {isLoading && productList.length === 0 && (
            <div className={'flex items-center justify-center py-16'}>
              <div className={'text-center'}>
                <div
                  className={
                    'mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900'
                  }
                />
                <p className={'text-gray-500'}>Loading products...</p>
              </div>
            </div>
          )}

          {/* No results */}
          {!isLoading && productList.length === 0 && (
            <div className={'py-16 text-center'}>
              <h3 className={'mb-2 text-lg font-medium text-gray-900'}>No products found</h3>
              <p className={'mb-4 text-gray-500'}>Try adjusting your search query or filters</p>
            </div>
          )}

          {/* Products grid */}
          {displayProducts.length > 0 && (
            <VirtualizedProductGrid
              products={displayProducts}
              isLoading={isFetching}
              hasNextPage={enableInfiniteScroll ? hasNextPage : false}
              loadNextPage={enableInfiniteScroll ? loadNextPage : undefined}
              onProductClick={handleProductClick}
              className={'mb-8'}
            />
          )}

          {/* Traditional pagination */}
          {showPagination && !enableInfiniteScroll && totalPages > 1 && (
            <div className={'mt-8 flex items-center justify-center space-x-2'}>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className={
                  'hover:bg-gray-50 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                    className={`rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${
                      pageNum === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-50 border border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className={
                  'hover:bg-gray-50 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 disabled:cursor-not-allowed disabled:opacity-50'
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsWithVirtualization;
