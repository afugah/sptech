'use client';

import Location from '@images/icons/location-dot.svg';
import Mobile from '@images/icons/mobile.svg';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';
import { StoreDetailBreadcrumbs } from './components/StoreDetailBreadcrumbs';

const GoogleMapComponent = dynamic(() => import('./components/GoogleMapComponent'), {
  ssr: false,
});

type Props = {
  store: IStore;
};

export const StoreDetailContent: React.FC<Props> = ({ store }) => {
  const t = useTranslations();

  const parseOpeningHours = () => {
    if (!store?.openingHours || store.openingHours.length === 0) {
      return [
        { label: t('findstore.hours.mon-fri'), time: '10.00–18.00' },
        { label: t('findstore.hours.sat'), time: '11.00–16.00' },
        { label: t('findstore.hours.sun'), time: t('findstore.hours.closed') },
      ];
    }

    return store.openingHours.map((hours, index) => ({
      label: hours.split(' ')[0] || `Day ${index + 1}`,
      time: hours.split(' ').slice(1).join(' ') || hours,
    }));
  };

  const structuredHours = parseOpeningHours();

  return (
    <div className={'min-h-screen bg-white'}>
      <PageHeader component={'config'} hasHeaderFixed={false} />

      <div className={'pb-6 pt-28 sm:pt-40'}>
        <StoreDetailBreadcrumbs storeName={store.name} />
      </div>

      <div className={'w-full px-4 sm:px-6 lg:px-8'}>
        <div style={{ height: '550px', width: '100%' }}>
          <GoogleMapComponent center={store.position} stores={[store]} height={'550px'} />
        </div>
      </div>

      <div className={'mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20'}>
        <div className={'grid grid-cols-1 items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16'}>
          <div className={'px-4 sm:px-8 lg:px-12'}>
            <p className={'mb-2 text-xs font-bold uppercase tracking-widest'}>{store.location}</p>

            <h1 className={'mb-3 font-serif text-2xl sm:text-3xl lg:text-4xl'}>{store.name}</h1>
            <div className={'border-b border-gray-300'}></div>

            <div className={'mt-3 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'}>
              <div>
                <p className={'text-sm text-gray-800'}>{store.street}</p>
                <p className={'text-sm text-gray-800'}>
                  {store.postalNr} {store.city}
                </p>
              </div>
              <div className={'grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:gap-x-10'}>
                {structuredHours.map((hour, idx) => (
                  <React.Fragment key={idx}>
                    <div className={'text-xs uppercase text-gray-800'}>{hour.label}</div>
                    <div className={'text-right text-xs text-gray-800'}>{hour.time}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className={'my-3 border-b border-gray-300'}></div>

            <div
              className={
                'flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-x-6 sm:space-y-0 lg:space-x-10'
              }
            >
              {store.contact && (
                <button
                  className={'flex items-center space-x-2 text-sm text-gray-800 transition-colors hover:text-black'}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`tel:${store.contact}`);
                  }}
                >
                  <Mobile className={'h-4 w-4'} />
                  <span>{store.contact}</span>
                </button>
              )}

              <button
                className={'flex items-center space-x-2 text-sm text-gray-800 transition-colors hover:text-black'}
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${store.position.lat},${store.position.lng}`,
                    '_blank',
                  );
                }}
              >
                <Location className={'h-4 w-4'} />
                <span className={'text-xs font-medium uppercase tracking-wide'}>{t('findstore.get-directions')}</span>
              </button>
            </div>
          </div>

          <div>
            <Image
              src={store.imageUrl}
              alt={`Interior of ${store.name}`}
              className={'h-auto w-full object-cover'}
              width={800}
              height={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
