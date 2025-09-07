'use client';

import { type Libraries, useJsApiLoader } from '@react-google-maps/api';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';
import Loader from '@/src/components/ui/Loader';

const libraries = ['places', 'drawing', 'geometry'];

export function MapProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();

  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API as string,
    libraries: libraries as Libraries,
  });

  if (loadError)
    return (
      <p className={'container mt-24 text-center'}>{t('findstore.encountered-error-while-loading-google-maps')}</p>
    );

  if (!scriptLoaded)
    return (
      <div className={'container relative flex min-h-96 items-center justify-center'}>
        <Loader inverted />
      </div>
    );

  return children;
}
