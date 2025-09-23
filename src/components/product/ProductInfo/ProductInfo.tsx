'use client';

import { Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { ProductInfoTab } from '@/src/components/product/ProductInfo/Tab';

interface IProductInfoProps {
  children: React.ReactNode;
  className?: string;
}

interface IProductInfoTabProps<T = unknown> {
  id: string;
  title: string;
  data: T;
  children: (data: T) => React.ReactNode;
}

export const ProductInfo: React.FC<IProductInfoProps> = ({ children, className }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const tabs = useMemo(() => {
    return React.Children.toArray(children).filter((child): child is React.ReactElement<IProductInfoTabProps> => {
      if (!React.isValidElement(child) || child.type !== ProductInfoTab) {
        return false;
      }
      const props = child.props as IProductInfoTabProps;
      return (
        props.children &&
        typeof props.children === 'function' &&
        props.data !== undefined &&
        props.children(props.data) !== null
      );
    });
  }, [children]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={`mx-auto mb-6 w-full border-b border-gray-300 md:mb-2 ${className}`}>
      {tabs.map((child) => {
        const props = child.props;
        const isOpen = openSections.has(props.id);

        return (
          <div key={props.id} className={'w-full'}>
            <button
              onClick={() => toggleSection(props.id)}
              className={'flex w-full items-center justify-between border-t border-gray-300 py-4 text-left'}
            >
              <span className={'text-sm text-black'}>{props.title}</span>
              <Plus
                className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                  isOpen ? 'rotate-45' : 'rotate-0'
                }`}
              />
            </button>
            {isOpen && (
              <div className={'pb-4 pt-2'}>
                <div className={'text-md'}>{props.children(props.data)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
