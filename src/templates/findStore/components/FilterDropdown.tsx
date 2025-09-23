'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';

interface FilterDropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterDropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={
            'w-full rounded-none !border-0 !border-b !border-solid !border-gray-400 bg-white px-4 py-6 text-xs font-medium uppercase focus:ring-0 data-[placeholder]:text-black'
          }
        >
          <SelectValue placeholder={label} className={'text-xs'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className={'my-1 text-xs uppercase'}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterDropdown;
