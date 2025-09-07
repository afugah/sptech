import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import { CategoryPageDescription } from '@/src/components/product/CategoryPageDescription';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { ProductGridLoader } from '@/src/components/product/ProductGrid/ProductGridLoader';
import { Link } from '@/src/i18n/navigation';
import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type CategoryPage } from '@/src/types/framework/storyblok-components';
import { getMarketCode } from '@/src/util/locale';

type ICategoryPageProps = {
  story: {
    name: string;
    content: CategoryPage;
  };
  slug: string;
  locale: string;
  searchParams: { page?: string };
};

const CategoryPageComponent: React.FC<ICategoryPageProps> = async (props) => {
  const { slug, story, locale, searchParams } = props;
  const { title, subtitle, description } = story.content;

  const marketCode = getMarketCode(locale);

  /* #region Facets */

  const collectionService = di.resolve(CollectionService);
  const facets = await collectionService.getFacetsBySlugOrQuery(marketCode, slug);

  const priceFacet = facets.find((facet) => facet.name === 'price');

  const defaultSort: ICollectionSearch.Sort = {
    field: '',
    order: 'asc',
  };

  const defaultFilters: ICollectionSearch.Filter = {
    size: [],
    color: [],
    brand: [],
    category: [],
    price:
      priceFacet?.type === 'range'
        ? {
            // min: priceFacet.min,
            // max: priceFacet.max,
            min: 0,
            max: 50000,
          }
        : {
            min: 0,
            max: 50000,
          },
  };

  /* #endregion */
  const t = await getTranslations();
  return (
    <>
      <PageHeader
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        header_menu={story.content.header_menu as any}
        _uid={story.content._uid}
        component={'config'}
        hasHeaderFixed={true}
      />
      <div className={'container mb-16'}>
        <div className={'mb-8 mt-10 flex flex-col justify-between'}>
          <Breadcrumbs>
            <li>
              <Link href={'/'}>{t('common.home')}</Link>
            </li>
            {slug && slug.includes('/') ? (
              slug.split('/').map((part, index, arr) => {
                const href = '/' + arr.slice(0, index + 1).join('/');
                return (
                  <li key={index}>
                    {index === arr.length - 1 ? (
                      <Link href={href} className={'capitalize'}>
                        {title}
                      </Link>
                    ) : (
                      <Link href={href} className={'capitalize'}>
                        {part}
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              <li>{title}</li>
            )}
          </Breadcrumbs>

          <h1 className={'text-center'}>{title}</h1>

          <CategoryPageDescription description={description} subtitle={subtitle} />
        </div>

        <Suspense fallback={<div className={'animate-pulse'}>Loading products...</div>}>
          <ProductGridLoader
            slug={slug}
            searchParams={searchParams}
            defaultSort={defaultSort}
            defaultFilters={defaultFilters}
            facets={facets}
            useViewMore={true}
          />
        </Suspense>
      </div>
    </>
  );
};

export default CategoryPageComponent;
