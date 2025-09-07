'use client';

import { useMemo, useState } from 'react';
import { type CountryCode, type IStore, type StoreType } from '@/src/lib/framework/Store/domain/entities/IStore';

interface FilterState {
  country?: CountryCode;
  storeType: StoreType | 'all';
}

interface UseStoreFilteringReturn {
  filters: FilterState;
  setCountry: (country: CountryCode) => void;
  setStoreType: (storeType: StoreType | 'all') => void;
  filteredStores: IStore[];
  resetFilters: () => void;
}

export const useStoreFiltering = (
  allStores: { [country: string]: IStore[] },
  _defaultCountry?: CountryCode,
): UseStoreFilteringReturn => {
  const [filters, setFilters] = useState<FilterState>({
    country: 'all',
    storeType: 'concept store',
  });

  const setCountry = (country: CountryCode) => {
    setFilters((prev) => ({ ...prev, country }));
  };

  const setStoreType = (storeType: StoreType | 'all') => {
    setFilters((prev) => ({ ...prev, storeType }));
  };

  const resetFilters = () => {
    setFilters({
      country: 'all',
      storeType: 'concept store',
    });
  };

  const filteredStores = useMemo(() => {
    let stores: IStore[] = [];

    if (!filters.country || filters.country === 'all') {
      stores = Object.values(allStores).flat();
    } else {
      stores = allStores[filters.country] || [];
    }

    if (filters.storeType !== 'all') {
      stores = stores.filter((store) => store.type === filters.storeType);
    }

    return stores;
  }, [allStores, filters]);

  return {
    filters,
    setCountry,
    setStoreType,
    filteredStores,
    resetFilters,
  };
};
