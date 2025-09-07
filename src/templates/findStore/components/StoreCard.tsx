'use client';

import Location from '@images/icons/location-dot.svg';
import Mobile from '@images/icons/mobile.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { type Store } from '../mockStores';

type StoreCardProps = {
  store: Store;
  index: number;
  distance?: number;
  setMapCenter: (position: { lat: number; lng: number }) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export const StoreCard: React.FC<StoreCardProps> = ({ store, index, setMapCenter }) => {
  const t = useTranslations();
  const { name, location, position, street, postalNr, city, contact, imageUrl, slug, country } = store;
  const { lat, lng } = position;

  const imageOnLeft = index % 2 === 0;

  const router = useRouter();

  const handleStoreClick = useCallback(() => {
    router.push(`/store-locator/${slug}`);
  }, [router, slug]);

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
    <div className={'relative my-6 cursor-pointer overflow-hidden sm:my-8 lg:my-10'} onClick={handleStoreClick}>
      <div className={'block lg:hidden'}>
        <div className={'relative'}>
          <Image
            src={imageUrl}
            alt={`${name} store`}
            className={'h-48 w-full object-cover sm:h-64'}
            width={400}
            height={256}
          />
        </div>

        <div className={'bg-white p-6 sm:p-8'}>
          <p className={'mb-2 text-xs font-bold uppercase tracking-widest'}>{location}</p>
          <h2 className={'mb-3 font-serif text-2xl font-light leading-tight text-black sm:text-3xl'}>{name}</h2>
          <div className={'mb-4 border-b border-gray-300'}></div>

          <div className={'mb-6 space-y-4'}>
            <div className={'space-y-1 font-light text-gray-800'}>
              <p>{street}</p>
              <p>
                {postalNr} {city}
              </p>
              <p>{country}</p>
            </div>

            <div className={'grid grid-cols-2 gap-x-6 gap-y-1.5'}>
              {structuredHours.map((hour, idx) => (
                <React.Fragment key={idx}>
                  <div className={'text-xs uppercase text-gray-800'}>{hour.label}</div>
                  <div className={'text-right text-xs text-gray-800'}>{hour.time}</div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className={'mb-4 border-b border-gray-300'}></div>

          <div
            className={
              'flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-x-4 sm:space-y-0'
            }
          >
            {contact && (
              <button
                className={
                  'flex items-center justify-center space-x-2 text-sm font-light text-gray-900 transition-colors hover:text-black'
                }
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`tel:${contact}`);
                }}
              >
                <Mobile className={'h-4 w-4'} />
                <span>{contact}</span>
              </button>
            )}

            <button
              className={
                'flex items-center justify-center space-x-2 text-sm font-light text-gray-900 transition-colors hover:text-black'
              }
              onClick={(e) => {
                e.preventDefault();
                setMapCenter({ lat, lng });
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
              }}
            >
              <Location className={'h-4 w-4'} />
              <span className={'text-xs uppercase tracking-wide'}>{t('findstore.get-directions')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={'hidden lg:flex lg:items-center lg:overflow-hidden'}>
        <div className={`absolute bottom-0 top-0 ${imageOnLeft ? 'left-0' : 'right-0'} z-10 flex w-1/2 items-center`}>
          <Image
            src={imageUrl}
            alt={`${name} store`}
            className={'h-4/5 w-full object-cover'}
            width={600}
            height={480}
          />
        </div>

        <div
          className={`relative z-0 flex min-h-[400px] w-4/5 flex-col justify-between bg-white p-8 xl:min-h-[500px] xl:p-12 ${
            imageOnLeft ? 'ml-auto' : 'ml-8 mr-auto xl:ml-0'
          }`}
        >
          <div
            className={`pt-12 xl:pt-16 ${imageOnLeft ? 'pl-80 xl:pl-[450px]' : 'pl-8 pr-80 xl:pl-12 xl:pr-[450px]'}`}
          >
            <p className={'mb-2 text-xs font-bold uppercase tracking-widest'}>{location}</p>
            <h2 className={'mb-3 font-serif text-3xl font-light leading-tight text-black xl:text-4xl'}>{name}</h2>
            <div className={'mb-4 border-b border-gray-300'}></div>

            <div className={'mb-8 flex flex-col space-y-6 xl:flex-row xl:items-center xl:justify-between xl:space-y-0'}>
              <div className={'space-y-1 font-light text-gray-800'}>
                <p>{street}</p>
                <p>
                  {postalNr} {city}
                </p>
                <p>{country}</p>
              </div>

              <div className={'grid grid-cols-2 gap-x-8 gap-y-1.5 xl:gap-x-10'}>
                {structuredHours.map((hour, idx) => (
                  <React.Fragment key={idx}>
                    <div className={'text-xs uppercase text-gray-800'}>{hour.label}</div>
                    <div className={'text-right text-xs text-gray-800'}>{hour.time}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className={'mb-4 border-b border-gray-300'}></div>

            <div
              className={
                'flex flex-col space-y-4 xl:flex-row xl:items-center xl:justify-between xl:space-x-8 xl:space-y-0'
              }
            >
              {contact && (
                <button
                  className={
                    'flex items-center space-x-2 text-sm font-light text-gray-900 transition-colors hover:text-black'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`tel:${contact}`);
                  }}
                >
                  <Mobile className={'h-4 w-4'} />
                  <span>{contact}</span>
                </button>
              )}

              <button
                className={
                  'flex items-center space-x-2 text-sm font-light text-gray-900 transition-colors hover:text-black'
                }
                onClick={(e) => {
                  e.preventDefault();
                  setMapCenter({ lat, lng });
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
              >
                <Location className={'h-4 w-4'} />
                <span className={'text-xs uppercase tracking-wide'}>{t('findstore.get-directions')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
