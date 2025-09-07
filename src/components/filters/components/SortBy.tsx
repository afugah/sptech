import { useTranslations } from 'next-intl';
import React from 'react';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import FilterWrapper from './FilterWrapper';

interface ISortByProps {
  defaultSort: ICollectionSearch.Sort;
  onSortChange: (sort?: ICollectionSearch.Sort) => void;
}
interface ISortOption {
  id: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

const SortBy: React.FC<ISortByProps> = ({ defaultSort, onSortChange }) => {
  const t = useTranslations();

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

  return (
    <FilterWrapper key={`sort`} header={t('common.sort-by')}>
      <ul className={'flex flex-col gap-[10px] text-sm'}>
        <li className={'flex items-center'}>
          <input
            type={'radio'}
            name={'sort'}
            onChange={() => {
              onSortChange();
            }}
            id={'default'}
            checked={!defaultSort?.field}
            className={'mr-2'}
          />
          <label className={'uppercase'} htmlFor={'default'}>
            {t('product.filter.default-filter-title')}
          </label>
        </li>

        {sortOptions.map((item) => (
          <li key={item.id} className={'flex items-center'}>
            <input
              type={'radio'}
              name={'sort'}
              onChange={() => {
                onSortChange({ field: item.field, order: item.order });
              }}
              id={item.id}
              checked={defaultSort?.field === item.field && defaultSort?.order === item.order}
              className={'mr-2'}
            />
            <label className={'uppercase'} htmlFor={item.id}>
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </FilterWrapper>
  );
};

export default SortBy;
