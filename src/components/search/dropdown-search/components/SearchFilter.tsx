import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { Suspense, useEffect, useState } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { type FilterState } from './ProductFilters';

const SearchFilterComponent = ({
  setFilterState,
}: {
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}) => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const t = useTranslations();
  const [search, setSearch] = useState<string>(query || '');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearchQuery = () => {
    if (search.trim() === '') return;
    const newPath = `/search?q=${encodeURIComponent(search.trim())}`;
    setFilterState({});
    const checkpathname = (pathname as string).includes('/search');

    if (!checkpathname) router.push(newPath);
    else router.replace(newPath);
  };
  useEffect(() => {
    if (query) {
      setSearch(query);
    }
  }, [query]);

  return (
    <div className={'space-y-9'}>
      <p className={'mt-4 w-full text-center font-serif text-4xl uppercase text-black md:mt-6'}>
        {t('search.search-results')}
      </p>
      <div className={'relative mx-auto w-full border-b-2 border-b-backgroundAlternative md:w-11/12'}>
        <Input
          autoFocus
          aria-label={t('search.search')}
          placeholder={t('search.search')}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className={
            ' h-14 w-11/12 border-x-0 border-b-2 border-t-0  border-black/20 px-0 py-0 font-serif text-[2rem] placeholder:text-[1.8rem] focus-visible:ring-0  md:text-[1.8rem]'
          }
        />

        <Button
          aria-label={t('search.search')}
          onClick={handleSearchQuery}
          variant={'custom'}
          className={
            'absolute right-0  top-0 flex h-full cursor-pointer  items-center justify-center px-0  py-0  [&_svg]:size-7'
          }
        >
          <Search size={34} strokeWidth={1} className={` h-8 w-8  bg-transparent stroke-gray-800 `} />
        </Button>
      </div>
    </div>
  );
};

const SearchFilter = ({ setFilterState }: { setFilterState: React.Dispatch<React.SetStateAction<FilterState>> }) => {
  return (
    <Suspense fallback={<div className={'bg-gray-100 h-14 animate-pulse rounded'} />}>
      <SearchFilterComponent setFilterState={setFilterState} />
    </Suspense>
  );
};

export default SearchFilter;
