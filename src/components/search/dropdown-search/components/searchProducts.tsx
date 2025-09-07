'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { InitialSearchProductGridStatic } from '@/src/components/product/ProductGrid/InitialSearchProductGrid';
import { useSearchProduct } from '@/src/components/search/dropdown-search/components/useSearchProduct';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';

const SearchProductList = ({ searchString }: { searchString: string }) => {
  const t = useTranslations();
  const defaultFilters: ICollectionSearch.Filter = {
    size: [],
    color: [],
    brand: [],
    category: [],
    price: {
      min: 0,
      max: 50000,
    },
  };

  const defaultSort: ICollectionSearch.Sort = {
    field: '',
    order: 'asc',
  };

  const { productList, isLoading } = useSearchProduct({
    q: searchString,
    defaultSort,
    defaultFilters,
    initialPage: 1,
  });

  return (
    <div>
      <div className={'mb-4 flex items-center justify-between'}>
        <p className={'font-sans tracking-widest text-black'}>
          {searchString ? t('search.product-matches') : t('search.trending-products')}
        </p>
        {searchString && productList?.length > 0 && !isLoading && (
          <Link href={`/search?q=${searchString}`} className={'font-sans text-black underline'}>
            {t('search.view-all')}
          </Link>
        )}
      </div>
      <div className={'my-8'}>
        {productList.length === 0 && !isLoading && searchString && (
          <p className={'mb-6 text-center text-3xl font-medium'}>{t('search.no-results')}</p>
        )}
        <InitialSearchProductGridStatic isLoading={isLoading} productList={productList || []} />
      </div>
    </div>
  );
};

export default SearchProductList;
