'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { type CountryCode } from '@/src/lib/framework/Store/domain/entities/IStore';
import FilterDropdown from './FilterDropdown';

interface CountryFilterProps {
  value?: CountryCode;
  onChange: (value: CountryCode) => void;
  className?: string;
}

const CountryFilter: React.FC<CountryFilterProps> = ({ value, onChange, className }) => {
  const t = useTranslations();

  const countryOptions = [
    { value: 'all', label: t('findstore.filters.country') },
    { value: 'se', label: t('countries.se') },
    { value: 'no', label: t('countries.no') },
    { value: 'fi', label: t('countries.fi') },
    { value: 'es', label: t('countries.es') },
    { value: 'au', label: t('countries.au') },
  ];

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue as CountryCode);
  };

  return (
    <FilterDropdown
      label={t('findstore.filters.country')}
      options={countryOptions}
      value={value}
      onChange={handleChange}
      className={className}
    />
  );
};

export default CountryFilter;
