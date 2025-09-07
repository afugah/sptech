import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';
import { Input } from '@/src/components/shadcn/input';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import ProductsCategories from '../../product/ProductsCategories';
import SearchProductList from './components/searchProducts';

const DropdownSearch = () => {
  const t = useTranslations();
  const [search, setSearch] = useState<string>('');
  const local = useLocale();

  const debouncedSearchUpdate = useDebounceCallback((searchValue: string) => {
    setSearch(searchValue);
  }, 500);

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value;
      debouncedSearchUpdate(searchValue);
    },
    [debouncedSearchUpdate],
  );

  return (
    <motion.div
      key={'modal'}
      initial={{ opacity: 0.8, y: -300 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -300 }}
      transition={{ duration: 0.2 }}
      className={'fixed inset-0 z-30 h-screen w-full bg-alabaster font-serif'}
    >
      <ScrollArea className={'h-full w-full'}>
        <div className={'mt-20 h-full w-full px-4 md:mt-[10rem] lg:px-16 lg:pr-14'}>
          <div className={'grid h-full w-full lg:grid-cols-[300px_1fr]'}>
            <div className={'hidden px-2 lg:block'}>
              <ProductsCategories searchText={search} locale={local} />
            </div>
            <div className={'w-full'}>
              <div className={'relative w-full border-b-2 border-b-black/10'}>
                <Input
                  autoFocus
                  aria-label={t('search.search')}
                  placeholder={t('search.search')}
                  onChange={onSearchChange}
                  className={
                    'h-10 w-full border-x-0 px-0 py-0 text-[2rem] placeholder:font-serif placeholder:text-[1.8rem] placeholder:text-black/40 focus-visible:ring-0 md:text-[1.8rem]'
                  }
                />

                <Search
                  className={
                    'absolute right-0  top-0 flex h-full cursor-pointer  items-center justify-center px-0  py-0  text-black/60'
                  }
                />
              </div>
              <div className={'mt-8'}>
                <SearchProductList searchString={search} />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default DropdownSearch;
