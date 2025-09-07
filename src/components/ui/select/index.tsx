import ArrowIcon from '@images/icons/arrow.svg';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

interface SelectProps<T> {
  label: string;
  selectedItem: T | undefined;
  items: T[];
  onSelect: (item: T) => void;
  renderSelectedItem: (item: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
  getItemKey: (item: T) => string;

  disabled?: boolean;
  emptyElement?: string | React.ReactNode;
}

export const Select = <T,>({
  label,
  selectedItem,
  items,
  onSelect,
  renderSelectedItem,
  renderItem,
  getItemKey,
  disabled = false,
  emptyElement,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(selectRef as React.RefObject<HTMLDivElement>, () => setIsOpen(false));

  const onSelectClick = () => {
    if (disabled) return;

    setIsOpen(!isOpen);
  };

  return (
    <div className={'relative w-full'}>
      <h3 className={'mb-2 w-full font-sans text-xs uppercase'}>{label}</h3>

      <div ref={selectRef} className={'contents'}>
        <div
          className={`w-full rounded-md border border-gray-300 transition-all duration-300 ${isOpen ? 'shadow-lg' : ''}`}
        >
          <div
            className={classNames('flex w-full cursor-pointer select-none items-center justify-between p-4', {
              'opacity-50': disabled,
            })}
            onClick={onSelectClick}
          >
            {selectedItem ? (
              <span className={'flex items-center'}>{renderSelectedItem(selectedItem)}</span>
            ) : (
              emptyElement
            )}

            <ArrowIcon
              className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          </div>

          {isOpen && (
            <div
              className={`absolute left-0 top-full z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-md bg-white shadow-lg`}
            >
              <ul className={'w-full border-t border-gray-300'}>
                {items?.map((item) => (
                  <li
                    key={getItemKey(item)}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className={`hover:bg-gray-100 flex cursor-pointer items-center p-4 transition-colors ${
                      selectedItem && getItemKey(item) === getItemKey(selectedItem) ? 'bg-gray-100' : ''
                    }`}
                  >
                    {renderItem(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
