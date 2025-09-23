'use client';

import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';
import { useMarketSelector } from '@/src/hooks/useMarketSelector';
import { type IMarketSelectorProps } from '@/src/types/market';

const MarketSelector: React.FC<IMarketSelectorProps> = ({ hasHeaderFixed, bgColor }) => {
  const { selectedCountry, availableCountries, handleCountrySelect, isLoading } = useMarketSelector();
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return availableCountries;

    return availableCountries.filter((country) => country.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [availableCountries, searchQuery]);

  const allCountriesForSelect = useMemo(() => {
    if (selectedCountry && !filteredCountries.includes(selectedCountry)) {
      return [selectedCountry, ...filteredCountries];
    }
    return filteredCountries;
  }, [filteredCountries, selectedCountry]);

  if (isLoading) {
    return <div className={'h-8 w-16 animate-pulse rounded bg-gray-200'} />;
  }

  return (
    <Select value={selectedCountry} onValueChange={handleCountrySelect}>
      <SelectTrigger
        className={`flex h-auto w-auto min-w-0 items-center gap-1 rounded-sm border-0 bg-transparent px-2 py-1 text-sm font-medium transition-colors ${
          hasHeaderFixed && bgColor ? 'text-white' : 'text-black'
        }`}
      >
        <SelectValue placeholder={selectedCountry} />
      </SelectTrigger>
      <SelectContent className={'max-h-60 overflow-hidden border-0 bg-white shadow-lg'}>
        <div className={'sticky top-0 z-10 bg-creme/40 p-2'}>
          <input
            type={'text'}
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={
              'w-full rounded-sm border-none bg-transparent px-1 py-0 text-sm placeholder:text-gray-800 focus:outline-none'
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className={'max-h-48 overflow-y-auto'}>
          {allCountriesForSelect.map((countryName) => {
            const isSelected = countryName === selectedCountry;
            const matchesSearch = !searchQuery.trim() || countryName.toLowerCase().includes(searchQuery.toLowerCase());
            const shouldHide = isSelected && searchQuery.trim() && !matchesSearch;

            return (
              <SelectItem
                key={countryName}
                value={countryName}
                className={`cursor-pointer border-0 px-3 py-2 text-sm text-black ${shouldHide ? 'hidden' : ''}`}
              >
                {countryName}
              </SelectItem>
            );
          })}
          {filteredCountries.length === 0 && searchQuery && (
            <div className={'px-3 py-2 text-sm italic text-gray-500'}>{t('search.no-results')}</div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
};

export default MarketSelector;
