import { ChevronDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/src/components/shadcn/button';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/src/components/shadcn/dropdown-menu-custom';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type FilterState, type ISortOption } from './ProductFilters';

const SortFilter = ({
  label,
  filterName,
  filterData,
  openStates,
  toggleDropdown,
  defaultSort,
  onSortChange,
}: {
  label: string;
  filterName: keyof FilterState;
  filterData: ISortOption[];
  openStates: {
    gender: boolean;
    material: boolean;
    additionalinfo: boolean;
    sort: boolean;
    categorycode: boolean;
    sideFilter: boolean;
  };

  toggleDropdown: (dropdown: keyof typeof openStates) => void;
  defaultSort?: ICollectionSearch.Sort;
  onSortChange: (newSort?: ICollectionSearch.Sort) => void;
}) => {
  const t = useTranslations();

  return (
    <div className={'h-full py-0 text-center'}>
      <DropdownMenu modal={false} open={openStates[filterName]} onOpenChange={() => toggleDropdown(filterName)}>
        <DropdownMenuTrigger asChild>
          <Button
            type={'button'}
            variant={'custom'}
            aria-label={label}
            className={
              ' flex h-full w-full items-center gap-x-2 gap-y-1 py-4 text-xs font-semibold hover:bg-[#f5efec43] lg:grid lg:place-content-center lg:place-items-center lg:gap-0 lg:py-4 [&_svg]:size-5'
            }
          >
            <p className={'w-fit  uppercase text-black lg:w-full'}>{label}</p>
            <ChevronDownIcon
              size={34}
              strokeWidth={2}
              className={`h-6 w-6 duration-150 ${openStates[filterName] ? '-rotate-180' : ''}`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={'text-sans -mt-2 w-44 min-w-[10rem] border-none bg-white p-0 sm:w-60 lg:w-52 xl:w-60'}
        >
          <div className={'space-y-1 text-xs'}>
            <div className={'h-full w-full px-3 hover:bg-alabaster'}>
              <label
                htmlFor={`${filterName}-recommended`}
                className={'flex h-full w-full cursor-pointer flex-row items-center space-x-3 py-4'}
              >
                <Checkbox
                  className={'size-6 border-[#D9C2B6] data-[state=checked]:bg-[#D9C2B6]'}
                  id={`${filterName}-recommended`}
                  checked={!defaultSort?.field}
                  onCheckedChange={() => onSortChange()}
                />
                <p
                  className={
                    'text-xs font-medium uppercase leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  }
                >
                  {t('product.filter.default-filter-title')}
                </p>
              </label>
            </div>
            {filterData.map((option) => (
              <div key={option.id} className={'h-full w-full px-3 hover:bg-alabaster'}>
                <label
                  htmlFor={`${filterName}-${option.id}`}
                  className={'flex h-full w-full cursor-pointer flex-row items-center space-x-3 py-4'}
                >
                  <Checkbox
                    className={'size-6 border-[#D9C2B6] data-[state=checked]:bg-[#D9C2B6]'}
                    id={`${filterName}-${option.id}`}
                    checked={defaultSort?.field === option.field && defaultSort?.order === option.order}
                    onCheckedChange={() => onSortChange({ field: option.field, order: option.order })}
                  />
                  <p
                    className={
                      'text-xs font-medium uppercase leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                    }
                  >
                    {option.label}
                  </p>
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortFilter;
