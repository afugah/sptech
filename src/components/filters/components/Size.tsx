import { useTranslations } from 'next-intl';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import FilterWrapper from './FilterWrapper';

interface ISizeProps {
  name: keyof ICollectionSearch.Filter;
  values?: ICollectionSearch.FacetValue[];
  control: Control<ICollectionSearch.Filter, string>;
  checkedList?: string[];

  handleCheckboxChange: (commonName: keyof ICollectionSearch.Filter, itemValue: string) => void;
}

export const Size: React.FC<ISizeProps> = ({ name, values, handleCheckboxChange, control, checkedList }) => {
  const t = useTranslations();
  return (
    <FilterWrapper header={t('product.filter.size')}>
      <div className={'mt-4 flex flex-row flex-wrap gap-[10px]'}>
        {values?.map((item, index) => {
          const isChecked = checkedList?.includes(item.value);

          return (
            <Controller
              key={index}
              name={name}
              control={control}
              render={() => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange(name, item.value);
                  }}
                  className={`box-border cursor-pointer rounded-2xl border px-2 text-sm ${isChecked ? 'border-black' : 'border-transparent'}`}
                >
                  {item.value}
                </button>
              )}
            />
          );
        })}
      </div>
    </FilterWrapper>
  );
};
