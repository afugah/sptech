'use server';

import React from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import { SearchProductLoader } from '@/src/components/search/dropdown-search/components/SearchProductLoader';
import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { getMarketCode } from '@/src/util/locale';

type ISearchPageProps = {
  locale: string;
  searchParams: { q: string; page?: string };
};

const SearchPage: React.FC<ISearchPageProps> = async (props) => {
  const { locale, searchParams } = props;
  const collectionService = di.resolve(CollectionService);

  const marketCode = getMarketCode(locale);

  const facets = await collectionService.getFacetsBySlugOrQuery(marketCode, searchParams.q, true);

  const priceFacet = facets.find((facet) => facet.name === 'price');

  const defaultFilters: ICollectionSearch.Filter = {
    size: [],
    color: [],
    brand: [],
    gender: [],
    material: [],
    category: [],
    categorycode: [],
    additionalinfo: [],
    price:
      priceFacet?.type === 'range'
        ? {
            // min: priceFacet.min,
            // max: priceFacet.max,
            min: 0,
            max: 100000,
          }
        : {
            min: 0,
            max: 100000,
          },
  };

  const defaultSort: ICollectionSearch.Sort = {
    field: '',
    order: 'asc',
  };

  return (
    <>
      {/* <div id={'search-page-portal'} className={'relative'} />
       */}
      <div className={'relative z-20 h-40 w-full bg-alabaster'}></div>
      <PageHeader hasHeaderFixed={false} />
      <div className={' mb-16 pt-16'}>
        <SearchProductLoader
          defaultSort={defaultSort}
          searchParams={searchParams}
          defaultFilters={defaultFilters}
          facets={facets}
        />
      </div>
    </>
  );
};

export default SearchPage;
