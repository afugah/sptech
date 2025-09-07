'use client';

import React from 'react';
import { type StoreType } from '../mockStores';
import FilterDropdown from './FilterDropdown';

interface StoreTypeFilterProps {
  value?: StoreType | 'all';
  onChange: (value: StoreType | 'all') => void;
  className?: string;
}

const StoreTypeFilter: React.FC<StoreTypeFilterProps> = ({ value, onChange, className }) => {
  const storeTypeOptions = [
    { value: 'all', label: 'All Stores' },
    { value: 'concept store', label: 'Concept Stores' },
    { value: 'reseller', label: 'Resellers' },
  ];

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue as StoreType | 'all');
  };

  return (
    <FilterDropdown
      label={'Store Type'}
      options={storeTypeOptions}
      value={value}
      onChange={handleChange}
      className={className}
    />
  );
};

export default StoreTypeFilter;
