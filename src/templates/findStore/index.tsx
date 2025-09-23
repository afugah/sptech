'use client';

import Location from '@images/icons/location-dot.svg';
import Map from '@images/icons/map.svg';
import Mobile from '@images/icons/mobile.svg';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import Loader from '@/src/components/ui/Loader';
import { useWindowWidth } from '@/src/hooks/useWindowWidth';
import { useRouter } from '@/src/i18n/navigation';
import { type CountryCode, type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';
import { MEDIUM } from '@/src/styles/theme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/shadcn/select';
import CityFilter from './components/CityFilter';
import CountryFilter from './components/CountryFilter';
import SearchButton from './components/SearchButton';
import { StoreList } from './components/StoreList';

const GoogleMapComponent = dynamic(() => import('./components/GoogleMapComponent'), {
  ssr: false,
  loading: () => (
    <div className={'relative flex h-[80dvh] w-full items-center justify-center'}>
      <Loader inverted />
    </div>
  ),
});

type Props = {
  stores: { [country: string]: IStore[] };
  locale: string;
  initialFilters: {
    country: string;
    storeType: string;
    city: string;
  };
};

interface FilterState {
  country: CountryCode | 'all';
  storeType: string;
  city: string;
}

const FindStore: React.FC<Props> = ({ stores, initialFilters }) => {
  const t = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number | null>(1);
  const width = useWindowWidth();
  const isMobile = useMemo(() => width && width < MEDIUM, [width]);
  const [center, setCenter] = useState({ lat: 59.3293, lng: 18.0686 });
  const [expandedStore, setExpandedStore] = useState<number | null>(null);
  const [_mapZoom, _setMapZoom] = useState(8);

  const [filters, setFilters] = useState<FilterState>({
    country: initialFilters.country as CountryCode | 'all',
    storeType: initialFilters.storeType,
    city: initialFilters.city,
  });

  const handleStoreClick = useCallback(
    (slug: string) => {
      router.push(`/store-locator/${slug}`);
    },
    [router],
  );

  const handleExpandStore = useCallback((store: { id: number; position: { lat: number; lng: number } }) => {
    startTransition(() => {
      setExpandedStore(store.id);
      setCenter({ lat: store.position.lat, lng: store.position.lng });
      _setMapZoom(12);
    });
  }, []);

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  const setCountry = (country: CountryCode | 'all') => {
    setFilters((prev) => ({ ...prev, country }));
    const params = new URLSearchParams();
    if (country && country !== 'all') params.append('country', country);
    if (filters.storeType && filters.storeType !== 'all') params.append('storeType', filters.storeType);
    if (filters.city) params.append('city', filters.city);

    router.push(`/store-locator${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const setStoreType = (storeType: string) => {
    setFilters((prev) => ({ ...prev, storeType }));
    const params = new URLSearchParams();
    if (filters.country && filters.country !== 'all') params.append('country', filters.country);
    if (storeType && storeType !== 'all') params.append('storeType', storeType);
    if (filters.city) params.append('city', filters.city);

    router.push(`/store-locator${params.toString() ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    if (!isMobile) {
      setActiveTab(null);
    } else {
      setActiveTab(1);
    }
  }, [isMobile]);

  const filteredStores = useMemo(() => {
    let storeList: IStore[] = [];

    if (!filters.country || filters.country === 'all') {
      storeList = Object.values(stores).flat();
      storeList = storeList.filter((store) => store.type === 'concept store');
    } else {
      storeList = stores[filters.country] || [];

      if (filters.storeType !== 'all') {
        storeList = storeList.filter((store) => store.type === filters.storeType);
      }
    }

    if (filters.city) {
      storeList = storeList.filter((store) => store.city.toLowerCase().includes(filters.city.toLowerCase()));
    }

    return storeList;
  }, [stores, filters]);

  return (
    <div className={'bg-alabaster'}>
      <PageHeader component={'config'} hasHeaderFixed={false} />
      <div className={'pt-32 sm:pt-36 lg:pt-40'}>
        <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
          <h1
            aria-hidden={'true'}
            className={
              'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black sm:text-sm lg:text-lg'
            }
          >
            {t('menu.store-locator')}
          </h1>
          <h2 className={'text-center text-6xl uppercase text-white sm:text-8xl lg:text-9xl xl:text-[120px]'}>
            {t('menu.store-locator')}
          </h2>
        </div>
      </div>
      <Breadcrumbs className={'mb-10 flex items-center justify-center text-center text-sm font-bold uppercase'}>
        <li>
          <button onClick={handleHomeClick} className={'uppercase hover:underline'}>
            {t('common.home')}
          </button>
        </li>
        <li className={'text-xxs'}>{t('menu.store-locator')}</li>
      </Breadcrumbs>

      <div
        className={
          'mx-auto mt-6 w-11/12 max-w-5xl bg-white px-4 py-8 sm:mt-8 sm:px-8 sm:py-10 md:w-full lg:mt-10 lg:px-12 lg:py-12 xl:px-36'
        }
      >
        <div className={'grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6'}>
          <CountryFilter value={filters.country} onChange={setCountry} />
          <CityFilter />
          <SearchButton className={'w-full'} />
        </div>
      </div>
      <div className={''}>
        {filters.country === 'all' ? (
          <div className={'flex w-full'}>
            <div className={'w-full'}>
              <div className={'mt-10 py-8'}>
                <h2 className={'text-center font-sans text-lg font-bold'}>{t('findstore.concept-stores')}</h2>
              </div>
              <div className={'mx-4 sm:mx-6 lg:mx-8'}>
                <StoreList data={filteredStores} setCenter={setCenter} />
              </div>
            </div>
          </div>
        ) : (
          <div className={'mx-4 min-h-[90vh]'}>
            <div className={`mt-20 grid gap-10 pb-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-[400px_1fr]'}`}>
              <div>
                <div className={'bg-white px-8 py-10 '}>
                  <h3 className={'mb-1 border-b border-b-gray-300 pb-5 font-serif text-3xl font-light '}>
                    {t('findstore.filter-stores')}
                  </h3>

                  <label htmlFor={'storeType'} className={'mb-4 text-sm font-medium '}>
                    {t('findstore.store-type')}
                  </label>
                  <Select value={filters.storeType} onValueChange={(value) => setStoreType(value)}>
                    <SelectTrigger
                      className={
                        'w-full rounded-none !border-0 !border-b !border-solid !border-gray-300 bg-transparent py-6 text-sm uppercase tracking-wide focus:outline-none focus:ring-0'
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={'all'} className={'text-sm uppercase'}>
                        {t('findstore.all-stores')}
                      </SelectItem>
                      <SelectItem value={'concept store'} className={'text-sm uppercase'}>
                        {t('findstore.concept-stores')}
                      </SelectItem>
                      <SelectItem value={'reseller'} className={'text-sm uppercase'}>
                        {t('findstore.resellers')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={'h-6 border-none'}></div>

                <div className={'max-h-[780px] overflow-y-auto bg-white px-8 py-1'}>
                  <div className={'divide-y divide-gray-300'}>
                    {filteredStores.map((store, i) => (
                      <div
                        key={i}
                        className={`hover:bg-gray-50 cursor-pointer py-4 transition-colors ${expandedStore === store.id ? '-mx-8 bg-gray-800 px-6 text-white' : ''}`}
                        onClick={() => handleStoreClick(store.slug)}
                      >
                        <h4
                          className={`mb-1 font-sans text-sm font-bold uppercase ${expandedStore === store.id ? 'text-white' : ''}`}
                        >
                          {store.name}
                        </h4>
                        <p
                          className={`text-sm font-light leading-tight ${expandedStore === store.id ? 'text-white' : ''}`}
                        >
                          {store.location}
                        </p>
                        <p className={`text-sm font-light ${expandedStore === store.id ? 'text-white' : ''}`}>
                          {store.postalNr}
                        </p>

                        {expandedStore === store.id ? (
                          <div className={'mt-4 space-y-1'}>
                            <div className={'flex items-center space-x-2 text-sm font-light'}>
                              <Mobile className={'h-4 w-4 stroke-white'} />
                              <span>{store.contact}</span>
                            </div>

                            <button
                              className={'flex items-center space-x-2 text-sm font-light uppercase tracking-wide'}
                              onClick={() => {
                                setCenter({ lat: store.position.lat, lng: store.position.lng });
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${store.position.lat},${store.position.lng}`,
                                  '_blank',
                                );
                              }}
                            >
                              <Location className={'h-4 w-4 stroke-white'} />
                              <span>{t('findstore.get-directions')}</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            className={'mt-4 text-sm font-bold text-black'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandStore(store);
                            }}
                          >
                            {t('findstore.more-info')} +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!isMobile && (
                <div className={'relative bg-[#ece0db]'}>
                  <GoogleMapComponent
                    center={center}
                    height={'1000px'}
                    stores={
                      expandedStore ? filteredStores.filter((store) => store.id === expandedStore) : filteredStores
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {isMobile && filters.country && filters.country !== 'all' && (
          <div className={'fixed bottom-4 right-4'}>
            <button
              onClick={() => setActiveTab(activeTab === 2 ? 1 : 2)}
              className={'rounded-full bg-black p-3 text-white shadow-lg'}
            >
              <Map className={'h-6 w-6'} />
            </button>
          </div>
        )}

        {isMobile && filters.country && filters.country !== 'all' && activeTab === 2 && (
          <div className={'fixed inset-0 z-50 bg-white'}>
            <div className={'h-full'}>
              <GoogleMapComponent stores={filteredStores} center={center} />
              <button
                onClick={() => setActiveTab(1)}
                className={'absolute right-4 top-4 rounded-full bg-white p-2 shadow-lg'}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindStore;
