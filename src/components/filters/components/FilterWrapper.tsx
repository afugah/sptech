import React, { useState } from 'react';
interface IFilterWrapper {
  children: React.ReactNode;
  header: string;
}
const FilterWrapper: React.FC<IFilterWrapper> = ({ children, header }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={'relative h-auto w-full border-b border-creme py-5'}>
      <button className={'flex w-full justify-between text-left'} onClick={() => setIsOpen(!isOpen)}>
        <span className={'font-sans text-[12px] uppercase'}>{header}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>↑</span>
      </button>

      <div
        className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default FilterWrapper;
