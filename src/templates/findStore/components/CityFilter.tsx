'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import FilterDropdown from './FilterDropdown';

interface CityFilterProps {
  className?: string;
}

const CityFilter: React.FC<CityFilterProps> = ({ className }) => {
  const t = useTranslations();

  const cityOptions = [
    { value: 'stockholm', label: t('cities.stockholm') },
    { value: 'gothenburg', label: t('cities.gothenburg') },
    { value: 'malmo', label: t('cities.malmo') },
  ];

  const handleChange = (_value: string) => {
    // This will never be called since the component is disabled
  };

  return (
    <FilterDropdown
      label={t('findstore.filters.city')}
      options={cityOptions}
      value={''}
      onChange={handleChange}
      disabled={true}
      className={className}
    />
  );
};

export default CityFilter;
