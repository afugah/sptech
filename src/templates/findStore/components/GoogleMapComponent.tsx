'use client';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';
import { calculateGeolocationDistance } from '@/src/util/geolocationDistance';
import { getCenterOfStores } from '../helper';

const defaultMapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '80dvh',
};

const defaultMapZoom = 8;
const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [{ saturation: '-100' }, { lightness: '30' }],
  },
];
const defaultMapOptions: google.maps.MapOptions = {
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  cameraControl: false,
  tilt: 0,
  gestureHandling: 'auto',
  mapTypeId: 'roadmap',
  styles: mapStyles,
};

interface GoogleMapComponentProps {
  center: { lat: number; lng: number };
  stores: IStore[];
  height?: string;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ center, stores, height }) => {
  const [selectedMarker, setSelectedMarker] = useState<IStore | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [distanceToMarker, setDistanceToMarker] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition(position);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (selectedMarker && currentPosition) {
      const distance = calculateGeolocationDistance(
        { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude },
        selectedMarker.position,
      );
      setDistanceToMarker(distance);
    }
  }, [selectedMarker, currentPosition]);

  const mapCenter = center.lat && center.lng ? center : getCenterOfStores(stores);

  return (
    <GoogleMap
      mapContainerStyle={{ ...defaultMapContainerStyle, height: height || '80dvh' }}
      center={mapCenter}
      zoom={defaultMapZoom}
      options={defaultMapOptions}
    >
      {stores.map((marker) => (
        <Marker
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#F5F0EC',
            strokeColor: '#374151',
            strokeWeight: 2,
            fillOpacity: 1,
            scale: 1.5,
            anchor: new google.maps.Point(12, 22),
          }}
          key={marker.id}
          position={marker.position}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (
        <InfoWindow position={selectedMarker.position} onCloseClick={() => setSelectedMarker(null)}>
          <div className={'px-4 pb-4'}>
            <h2 className={'mb-2 text-lg font-bold'}>{selectedMarker.name}</h2>
            {selectedMarker.location !== selectedMarker.name && (
              <p className={'mb-1 text-sm'}>{selectedMarker.location}</p>
            )}
            {distanceToMarker !== null && (
              <p className={'mb-1 text-sm'}>
                <span>{distanceToMarker.toFixed(2)} km</span>
              </p>
            )}
            <p className={'mb-1 text-sm'}>
              <div className={'flex flex-col'}>
                {selectedMarker.street}
                <span>
                  {selectedMarker.postalNr} {selectedMarker.city}
                </span>
              </div>
            </p>
            <p className={'mb-1 py-2 text-sm'}>{selectedMarker.contact}</p>
            <div className={'mt-2'}>
              <ul className={'list-inside list-none'}>
                {selectedMarker.openingHours.map((hours, index) => (
                  <li key={index} className={'text-sm'}>
                    {hours}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
