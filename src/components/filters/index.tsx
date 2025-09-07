'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useFilters } from '@/src/context/filterContext';
import useDebounce from '@/src/hooks/useDebounce';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Categories } from './components/Categories';
import { Colors } from './components/Colors';
import FilterWrapper from './components/FilterWrapper';
import MultiRangeSlider from './components/RangeInput/RangeInput';
import { Size } from './components/Size';
import SortByDropdown from './components/SortBy';

interface IFiltersAndSortProps {
  productLength: number | null;
  facets: ICollectionSearch.Facets;
  onFiltersChange: (filter?: ICollectionSearch.Filter) => void;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
  defaultFilters: ICollectionSearch.Filter;
  defaultSort: ICollectionSearch.Sort;
}

export const FiltersAndSort: React.FC<IFiltersAndSortProps> = (props) => {
  const { defaultFilters, defaultSort, facets, onFiltersChange, onSortChange, productLength } = props;
  const { setIsFiltersSelectOpen, isFiltersSelectOpen } = useFilters();
  const t = useTranslations('');
  const onClose = () => setIsFiltersSelectOpen(false);
  const methods = useForm<ICollectionSearch.Filter>({ defaultValues: defaultFilters });
  const { control, setValue, watch, getValues, reset } = methods;
  const selectedFilter = watch();

  const debouncedHandleFilter = useDebounce((newFilters: ICollectionSearch.Filter) => {
    onFiltersChange(newFilters);
  }, 500);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setValue(`price.${name}` as 'price.min' | 'price.max', +value);
    debouncedHandleFilter(getValues());
  };

  const handleCheckboxChange = (commonName: keyof ICollectionSearch.Filter, itemValue: string) => {
    const values = selectedFilter[commonName] as string[];
    if (values.includes(itemValue)) {
      setValue(
        commonName,
        values.filter((i) => i !== itemValue),
      );
    } else {
      setValue(commonName, [...values, itemValue]);
    }
    debouncedHandleFilter(getValues());
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reset();
    onSortChange();
    onFiltersChange();
    debouncedHandleFilter(getValues());
  };

  return (
    <Drawer onClose={onClose} open={isFiltersSelectOpen} title={'Filters'}>
      <FormProvider {...methods}>
        <div className={'px-14'}>
          <SortByDropdown defaultSort={defaultSort} onSortChange={onSortChange} />
          {facets.map((facet, index) => {
            switch (facet.type) {
              case 'category': {
                return (
                  <Categories
                    checkedList={selectedFilter['category']}
                    key={`category-${index}`}
                    control={control}
                    name={facet.name as keyof ICollectionSearch.Filter}
                    values={facet.values}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                );
              }
              case 'text': {
                if (facet.name === 'color') {
                  return (
                    <Colors
                      checkedList={selectedFilter['color']}
                      key={`colors-${index}`}
                      control={control}
                      name={'color'}
                      values={facet.values}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  );
                } else if (facet.name === 'size') {
                  return (
                    <Size
                      checkedList={selectedFilter['size']}
                      key={`sizes-${index}`}
                      control={control}
                      name={'size'}
                      values={facet.values}
                      handleCheckboxChange={handleCheckboxChange}
                    />
                  );
                }
                return null;
              }
              case 'range': {
                return (
                  <FilterWrapper key={'price'} header={t('product.filter.price')}>
                    <MultiRangeSlider
                      minValue={facet.min}
                      maxValue={facet.max}
                      key={index}
                      onChange={handlePriceChange}
                      min={selectedFilter.price?.min as number}
                      max={selectedFilter.price?.max as number}
                      name={facet.name}
                    />
                  </FilterWrapper>
                );
              }

              default:
                return null;
            }
          })}
        </div>
      </FormProvider>
      <div className={'flex flex-col gap-5 px-14'}>
        <Button buttonType={Button.Type.Outline} onClick={handleReset}>
          {t('product.filters.clear-all')}
        </Button>

        <Button buttonType={Button.Type.Filled} onClick={onClose}>
          {productLength !== null
            ? `${t('product.filters.show')} ${productLength} ${t('product.filters.products')}`
            : `${t('product.filters.show')}`}
        </Button>
      </div>
    </Drawer>
  );
};
