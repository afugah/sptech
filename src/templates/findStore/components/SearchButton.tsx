'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/shadcn/button';

interface SearchButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const SearchButton: React.FC<SearchButtonProps> = ({ className = '', children }) => {
  const t = useTranslations();

  return (
    <Button
      className={`w-full bg-[#C4A389] px-4 py-6 text-sm font-medium uppercase text-black transition-colors hover:bg-[#B59375] ${className}`}
    >
      {children || t('common.search')}
    </Button>
  );
};

export default SearchButton;
