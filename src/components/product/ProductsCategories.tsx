import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { getMarketCode } from '@/src/util/locale';
import { getSearchFacets } from '../search/actions';
import { Skeleton } from '../shadcn/skeleton';
const ProductsCategories = ({ searchText, locale }: { searchText?: string; locale: string | undefined }) => {
  const marketCode = getMarketCode(locale as string);
  const [items, setItems] = React.useState<ICollectionSearch.Facets | []>([]);

  const [loading, setLoading] = React.useState(true);
  const t = useTranslations();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getSearchFacets(marketCode, searchText as string);

        if (!data) {
          setItems([]);
          return;
        }
        setItems(data);
      } catch (error) {
        console.error('Error fetching search facets: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchText, marketCode]);

  const categories = items.find((item) => item.name === 'category');

  function CategorySkeletonCard() {
    return (
      <div className={' mt-6 flex flex-col gap-y-2  text-left uppercase'}>
        {[...Array(4)].map((_, index) => (
          <div className={'flex max-h-max flex-col  space-y-3'} key={index}>
            <div className={'flex flex-col gap-y-4  '}>
              <Skeleton className={'h-3 w-[140px]  '} />
              <Skeleton className={'h-3 w-[190px] '} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={' mt-[5.5rem]'}>
      <p className={' font-sans '}>{searchText ? t('search.search-suggestions') : t('search.trending-searchs')}</p>
      <div className={' mt-6 flex flex-col gap-y-2  text-left uppercase'}>
        {loading && items?.length === 0 && <CategorySkeletonCard />}
        {categories?.values?.slice(0, 6)?.map((item) => {
          const value = item.value;
          const lowerValue = value.toLowerCase();
          const lowerSearch = searchText?.toLowerCase() || '';
          const matchIndex = lowerValue.indexOf(lowerSearch);
          return (
            <div key={value}>
              <Link
                href={`/search?q=${encodeURIComponent(value)}`}
                className={'break-words font-sans text-sm font-light text-gray '}
              >
                {matchIndex !== -1 && searchText ? (
                  <>
                    {value.slice(0, matchIndex)}
                    <strong className={'font-bold text-gray-900'}>
                      {value.slice(matchIndex, matchIndex + lowerSearch.length)}
                    </strong>
                    {value.slice(matchIndex + lowerSearch.length)}
                  </>
                ) : (
                  value
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsCategories;
