'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

interface ModelSizeDescriptionProps {
  size: string;
  length: string;
}

const ModelSizeDescription: React.FC<ModelSizeDescriptionProps> = ({ size, length }) => {
  const t = useTranslations('product-page');

  return (
    <>
      <div
        className={
          'absolute bottom-0 left-4 mb-5 flex items-center rounded-full bg-gray-200 bg-opacity-70 px-3 py-2 text-xs md:left-auto md:right-4'
        }
      >
        {t('model-size-description')}
        <span className={'px-0.5'}> {size} </span>
        {t('model-lenght-description')}
        <span className={'px-0.5'}> {length} cm </span>
        {t('model-lenght')}
      </div>
    </>
  );
};

export default ModelSizeDescription;
