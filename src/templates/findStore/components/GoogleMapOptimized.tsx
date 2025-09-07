'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';

// Loading component
const MapLoading = () => (
  <div className={'bg-gray-100 flex h-80 items-center justify-center rounded-lg'}>
    <div className={'text-center'}>
      <div className={'mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'}></div>
      <p className={'text-gray-600'}>Loading map...</p>
    </div>
  </div>
);

// Dynamic import for Google Maps with optimized loading
const GoogleMapComponent = dynamic(() => import('./GoogleMapComponent'), {
  loading: () => <MapLoading />,
  ssr: false,
});

interface GoogleMapOptimizedProps {
  center: { lat: number; lng: number };
  stores: IStore[];
  height?: string;
}

const GoogleMapOptimized: React.FC<GoogleMapOptimizedProps> = ({ center, stores, height }) => {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Load map only when user interacts or after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadMap(true);
    }, 1000); // Delay loading by 1 second

    return () => clearTimeout(timer);
  }, []);

  // Handle user interaction to load map immediately
  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
      setShouldLoadMap(true);
    }
  };

  if (!shouldLoadMap) {
    return (
      <div
        className={'bg-gray-100 flex h-80 cursor-pointer items-center justify-center rounded-lg'}
        onClick={handleUserInteraction}
        onMouseEnter={handleUserInteraction}
        style={{ height: height || '80dvh' }}
      >
        <div className={'text-center'}>
          <div className={'mb-4 text-6xl'}>🗺️</div>
          <p className={'mb-2 text-gray-600'}>Click to load interactive map</p>
          <p className={'text-sm text-gray-500'}>Showing {stores.length} stores</p>
        </div>
      </div>
    );
  }

  return <GoogleMapComponent center={center} stores={stores} height={height} />;
};

export default GoogleMapOptimized;
