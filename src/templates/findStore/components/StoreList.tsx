import React, { useEffect, useMemo, useState } from 'react';
import { calculateGeolocationDistance } from '@/src/util/geolocationDistance';
import { type Store } from '../mockStores';
import { StoreCard } from './StoreCard';

interface IStoreList {
  data: Store[];
  setCenter: (center: { lat: number; lng: number }) => void;
}

export const StoreList: React.FC<IStoreList> = ({ data, setCenter }) => {
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
      );
    }
  }, []);

  const dataWithDistance = useMemo(
    () =>
      userPosition
        ? data.map((item) => ({
            ...item,
            distance: +calculateGeolocationDistance(userPosition, item.position).toFixed(2),
          }))
        : null,
    [data, userPosition],
  );

  const sortedData = useMemo(
    () => (dataWithDistance ? dataWithDistance.sort((a, b) => a.distance - b.distance) : data),
    [dataWithDistance, data],
  );

  return (
    <div className={'w-full'}>
      {sortedData?.map((store, index) => {
        return (
          <StoreCard
            key={`${store.id}-${index}`}
            store={store}
            index={index}
            distance={store.distance || 0}
            setMapCenter={setCenter}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        );
      })}
    </div>
  );
};
