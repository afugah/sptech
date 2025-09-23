import React from 'react';
import { type FilterItem, type FilterState } from '@/src/components/search/dropdown-search/components/ProductFilters';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/shadcn/accordion';
import { Checkbox } from '@/src/components/shadcn/checkbox';

const SHARED_STYLES = {
  trigger: 'font-sans text-black text-lg uppercase hover:no-underline',
  content: 'flex flex-col gap-4 text-balance',
  container: 'space-y-1 text-sm',
  optionWrapper: 'h-full w-full px-3 hover:bg-alabaster',
  label: 'flex  h-full w-full cursor-pointer flex-row items-center space-x-3 py-4',
  checkbox: 'size-6 border-[#D9C2B6] data-[state=checked]:bg-[#D9C2B6]',
  text: 'text-sm text-black font-medium uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
} as const;

interface FilterConfig {
  key: keyof FilterState;
  label: string;
  accordionValue: string;
  data: FilterItem;
}

interface FilterSectionProps {
  config: FilterConfig;
  filterState: FilterState;
  handleCheckboxChange: (filterName: keyof FilterState, value: string, checked: boolean) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ config, filterState, handleCheckboxChange }) => {
  const { key, label, accordionValue, data } = config;

  if (!data?.values?.length) return null;

  return (
    <AccordionItem value={accordionValue} className={'border-b-0'}>
      <AccordionTrigger className={SHARED_STYLES.trigger}>{label}</AccordionTrigger>
      <AccordionContent className={SHARED_STYLES.content}>
        <div className={SHARED_STYLES.container}>
          {data.values.map((option) => (
            <div key={option.value} className={SHARED_STYLES.optionWrapper}>
              <label htmlFor={`${option.name}-${option.value}`} className={SHARED_STYLES.label}>
                <Checkbox
                  className={SHARED_STYLES.checkbox}
                  id={`${option.name}-${option.value}`}
                  checked={filterState[key]?.includes(option.value) || false}
                  onCheckedChange={(checked) => handleCheckboxChange(key, option.value, checked as boolean)}
                />
                <p className={SHARED_STYLES.text}>{option.value}</p>
              </label>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

interface SideFiltersProps {
  gender: FilterItem;
  material: FilterItem;
  additionalinfo: FilterItem;
  categorycode: FilterItem;
  handleCheckboxChange: (filterName: keyof FilterState, value: string, checked: boolean) => void;
  filterState: FilterState;
}

const SideFilters: React.FC<SideFiltersProps> = ({
  gender,
  material,
  additionalinfo,
  categorycode,
  handleCheckboxChange,
  filterState,
}) => {
  const filterConfigs: FilterConfig[] = [
    {
      key: 'gender',
      label: 'Gender',
      accordionValue: 'gender',
      data: gender,
    },
    {
      key: 'material',
      label: 'Material',
      accordionValue: 'material',
      data: material,
    },
    {
      key: 'additionalinfo',
      label: 'Gemstone',
      accordionValue: 'gemstone',
      data: additionalinfo,
    },
    {
      key: 'categorycode',
      label: 'Product Type',
      accordionValue: 'product-type',
      data: categorycode,
    },
  ];

  return (
    <div className={'mt-10 px-2'}>
      <Accordion type={'multiple'} className={' w-full'}>
        {filterConfigs.map((config) => (
          <FilterSection
            key={config.key}
            config={config}
            filterState={filterState}
            handleCheckboxChange={handleCheckboxChange}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default SideFilters;
