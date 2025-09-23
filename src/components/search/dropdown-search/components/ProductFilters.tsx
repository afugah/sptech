import { ChevronDownIcon, ChevronRightIcon, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/src/components/shadcn/dropdown-menu-custom';
import { Sheet, SheetTrigger } from '@/src/components/shadcn/sheet-custom';
import { SheetComponent } from '@/src/components/ui/sheet';
import SideFilters from '@/src/components/ui/sheet/components/sideFilter/filters';
import useDebounce from '@/src/hooks/useDebounce';
import { useRouter } from '@/src/i18n/navigation';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import SearchFilter from './SearchFilter';
import SortFilter from './SortFilter';
export interface FilterItem {
  name: string;
  type: string;
  values: Array<{
    value: string;
    count: number;
    name: string;
    selected: boolean;
    has_children: boolean;
  }>;
  sort_type: string;
}
export interface ISortOption {
  id: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

interface IProductGridProps {
  productList: ICollectionItem[];
  total?: number;

  facets: ICollectionSearch.Facets;
  onFiltersChange: (filter?: ICollectionSearch.Filter) => void;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
  queryString: string;
  showSearchFilter: boolean;
}

export type FilterState = {
  gender?: string[];
  material?: string[];
  additionalinfo?: string[];
  categorycode?: string[];
  sort?: string[];
  sideFilter?: string[];

  // Add other filter types as needed
};

export const FilterGrid = ({
  facets,
  total,
  onFiltersChange,
  onSortChange,
  defaultSort,
  queryString,
  showSearchFilter,
}: IProductGridProps) => {
  // Transform facets into accessible categories
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const t = useTranslations();
  const router = useRouter();

  const sortOptions: ISortOption[] = [
    {
      id: 'lowest-price',
      label: t('product.filter.lowest-price'),
      field: 'price',
      order: 'asc',
    },
    {
      id: 'highest-price',
      label: t('product.filter.highest-price'),
      field: 'price',
      order: 'desc',
    },
    {
      id: 'latest-in',
      label: t('product.filter.latest'),
      field: 'created_at',
      order: 'desc',
    },
  ];

  const [filterState, setFilterState] = useState<FilterState>({
    gender: [],
    additionalinfo: [],
    material: [],
    categorycode: [],
  });
  const selectedFilters = Object.entries(filterState).reduce<string[]>((acc, [_, values]) => {
    if (values && values.length > 0) {
      return [...acc, ...values];
    }
    return acc;
  }, []);
  const result: Record<string, FilterItem> = facets.reduce(
    (acc, item) => {
      acc[item.name] = item;
      return acc;
    },
    {} as Record<string, FilterItem>,
  );

  const { gender, additionalinfo, material, categorycode } = result;

  // State for each dropdown's open state
  const [openStates, setOpenStates] = useState({
    gender: false,
    material: false,
    additionalinfo: false,
    sort: false,
    categorycode: false,
    sideFilter: false,
  });

  const debouncedHandleFilter = useDebounce((newFilters: ICollectionSearch.Filter) => {
    onFiltersChange({
      ...newFilters,
      price: { min: 0, max: 100000 },
    });
  }, 500);

  // Filter state

  // Toggle dropdown
  const toggleDropdown = (dropdown: keyof typeof openStates) => {
    setOpenStates((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const handleRemoveFilter = (filterValue: string) => {
    setFilterState((prev) => {
      const newState = { ...prev };
      for (const [filterName, values] of Object.entries(newState)) {
        if (values && values.includes(filterValue)) {
          newState[filterName as keyof FilterState] = values.filter((v) => v !== filterValue);
          break;
        }
      }
      return newState;
    });
  };
  // Handle checkbox changes
  const handleCheckboxChange = (filterName: keyof FilterState, value: string, checked: boolean) => {
    const newState = {
      ...filterState,
      [filterName]: checked
        ? [...(filterState[filterName] || []), value]
        : (filterState[filterName] || []).filter((v) => v !== value),
    };

    setFilterState(newState);
    debouncedHandleFilter(newState);
  };
  // console.log(filterState);

  // Render a single filter dropdown
  const renderFilterDropdown = (
    filterData: FilterItem | ISortOption[] | string | undefined,
    filterName: keyof FilterState,
    label: string,
  ) => {
    if (!filterData) return null;

    if (filterData === 'sideFilter') {
      return (
        <div className={` block h-full py-0 text-center lg:hidden`}>
          <Sheet open={openFilterSheet} onOpenChange={setOpenFilterSheet}>
            <SheetTrigger asChild>
              <Button
                type={'button'}
                variant={'custom'}
                aria-label={label}
                className={
                  'flex h-full w-full items-center  gap-x-2 gap-y-1 text-sm font-semibold hover:bg-[#f5efec43] [&_svg]:size-5'
                }
              >
                <p className={'mx-0 w-fit  p-0 uppercase'}>{label}</p>
                <ChevronRightIcon size={34} strokeWidth={2} className={`ml-0 inline-block h-6 w-6 duration-150 `} />
              </Button>
            </SheetTrigger>
            <SheetComponent setOpenSheet={setOpenFilterSheet} title={'Filter by'}>
              <SideFilters
                gender={gender as FilterItem}
                material={material as FilterItem}
                additionalinfo={additionalinfo as FilterItem}
                categorycode={categorycode as FilterItem}
                handleCheckboxChange={handleCheckboxChange}
                filterState={filterState}
              />
            </SheetComponent>
          </Sheet>
        </div>
      );
    }

    if (label === 'Sort') {
      return (
        <SortFilter
          label={label}
          filterName={filterName}
          filterData={sortOptions}
          openStates={openStates}
          toggleDropdown={toggleDropdown}
          defaultSort={defaultSort}
          onSortChange={onSortChange}
        />
      );
    }

    return (
      <>
        <div
          className={` ${filterName === 'gender' || filterName === 'material' || filterName === 'additionalinfo' || filterName === 'categorycode' ? 'hidden lg:block' : ''} h-full py-0 text-center`}
        >
          <DropdownMenu modal={false} open={openStates[filterName]} onOpenChange={() => toggleDropdown(filterName)}>
            <DropdownMenuTrigger asChild>
              <Button
                type={'button'}
                variant={'custom'}
                aria-label={label}
                className={
                  'grid h-full w-full place-content-center place-items-center gap-0 gap-y-1 text-sm font-semibold hover:bg-[#f5efec43] lg:py-4 [&_svg]:size-5'
                }
              >
                <p className={'w-full uppercase text-black'}>{label}</p>
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
              <div className={'space-y-1 text-sm'}>
                {(filterData as FilterItem)?.values?.map((option) => (
                  <div key={option.value} className={'h-full w-full px-3  hover:bg-alabaster'}>
                    <label
                      htmlFor={`${filterName}-${option.value}`}
                      className={'flex h-full w-full cursor-pointer flex-row items-center space-x-3 py-4'}
                    >
                      <Checkbox
                        className={'size-6 border-[#D9C2B6] data-[state=checked]:bg-[#D9C2B6]'}
                        id={`${filterName}-${option.value}`}
                        checked={filterState[filterName]?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(filterName, option.value, checked as boolean)
                        }
                      />
                      <p
                        className={
                          'text-sm font-medium uppercase leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        }
                      >
                        {option.value}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  };

  return (
    <section className={' mx-5 mb-10 space-y-8'}>
      {showSearchFilter && (
        <>
          <SearchFilter setFilterState={setFilterState} />
          <div className={' w-full px-2 pt-6  sm:px-24'}>
            <div className={'flex w-full justify-between gap-x-4 '}>
              <div className={'text-sm font-semibold uppercase sm:text-sm '}>
                <p className={'text-black'}>
                  {t('product-page.products')} <span className={'ml-1 '}>({total})</span>
                </p>
              </div>
              <div className={' text-sm uppercase  sm:text-sm '}>
                <p className={'text-black'}>
                  {t('product-page.collections')} <span className={'ml-1 '}>()</span>
                </p>
              </div>
              <div className={' text-sm uppercase sm:block  sm:text-sm '}>
                <p className={'text-black'}>
                  {t('product-page.articles')} <span className={'ml-1 '}>()</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <div className={'h-full w-full px-4 pt-2'}>
        <div className={'min-h-10 pb-0'}>
          {selectedFilters?.length > 0 && (
            <div className={'flex flex-wrap items-center gap-2'}>
              {selectedFilters?.map((filterValue, index) => (
                <div
                  key={index}
                  className={'bg-gray-100 flex items-center gap-1 rounded-full px-2 py-1 text-sm uppercase'}
                >
                  {filterValue}
                  <button
                    onClick={() => handleRemoveFilter(filterValue)}
                    className={'ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-200'}
                    aria-label={`Remove ${filterValue}`}
                  >
                    <X className={'h-4 w-4 text-gray-700'} />
                  </button>
                </div>
              ))}
              <Button
                variant={'secondary'}
                type={'button'}
                aria-label={t('product.filters.clear-all')}
                onClick={() => {
                  const newPath = `/search?q=${encodeURIComponent(queryString || '')}`;

                  router.push(newPath);
                  // onSortChange(defaultSort);
                  setFilterState({});
                  // onFiltersChange({ gender: [], category: [], material: [], categorycode: [] });
                }}
                className={'ml-2 h-6 bg-secondary-600 px-2 py-0  text-sm uppercase text-white hover:bg-gray-800 '}
              >
                {t('product.filters.clear-all')}
              </Button>
            </div>
          )}
        </div>

        <div className={'grid w-full grid-cols-2 items-center gap-x-4  bg-[#D9C2B6] px-0  sm:px-6 lg:grid-cols-5'}>
          {renderFilterDropdown(gender, 'gender', 'Gender')}
          {renderFilterDropdown(material, 'material', 'Material')}
          {renderFilterDropdown(additionalinfo, 'additionalinfo', 'Gemstone')}
          {renderFilterDropdown(categorycode, 'categorycode', 'Product Type')}
          {renderFilterDropdown('sideFilter', 'sideFilter', 'Filter')}
          {renderFilterDropdown(sortOptions, 'sort', 'Sort')}
        </div>
      </div>
    </section>
  );
};
