import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { ColorVariantCircle } from '../../ui/ColorVariantCircle';
import FilterWrapper from './FilterWrapper';

interface IColors {
  name: keyof ICollectionSearch.Filter;
  values?: ICollectionSearch.FacetValue[];
  control: Control<ICollectionSearch.Filter, string>;
  checkedList?: string[];
  handleCheckboxChange: (commonName: keyof ICollectionSearch.Filter, itemValue: string) => void;
}

export const Colors: React.FC<IColors> = ({ name, values, handleCheckboxChange, checkedList, control }) => {
  const t = useTranslations();
  return (
    <FilterWrapper header={t('product.filter.colors')}>
      <div className={'mt-4 flex flex-row flex-wrap gap-2.5'}>
        {values?.map((item) => {
          const isChecked = checkedList?.includes(item.value);
          const translationMap: Record<string, string> = {
            Offwhite: 'white',
            'Off white': 'white',
            'Off White': 'white',
            Copper: 'gold',
            Vit: 'white',
            Svart: 'black',
            Röd: 'red',
            Blå: 'blue',
            Grön: 'green',
            Guld: 'gold',
            Silver: 'silver',
            Brun: 'brown',
            Rosa: 'pink',
            Gul: 'yellow',
            Grå: 'gray',
            Lila: 'purple',
            Koppar: 'gold',
            // Add more translations as needed
          };
          const blockedValues = [
            'Other',
            'Annan',
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'J',
            'K',
            'L',
            'M',
            'N',
            'O',
            'P',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'V',
            'W',
            'X',
            'Y',
            'Z',
            'Å',
            'Ä',
            'Ö',
          ];
          const translatedValue = translationMap[item.value] || item.value;
          const isBlocked = blockedValues.includes(item.value);
          if (isBlocked) return null;
          return (
            <Controller
              key={item.value}
              name={name}
              control={control}
              render={() => (
                <div
                  onClick={() => handleCheckboxChange(name, item.value)}
                  className={classNames('h-5 w-5 rounded-full border', { 'border-gray': isChecked })}
                >
                  <ColorVariantCircle
                    className={'cursor-pointer'}
                    size={16}
                    color={translatedValue}
                    title={item.value}
                  />
                </div>
              )}
            />
          );
        })}
      </div>
    </FilterWrapper>
  );
};
