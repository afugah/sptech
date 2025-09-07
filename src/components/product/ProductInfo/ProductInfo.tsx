'use client';

import React, { useMemo } from 'react';
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

  return (
    <div className={`mx-auto mb-6 w-full md:mb-2 ${className}`}>
      {tabs.map((child) => {
        const props = child.props;
        return (
          <div key={props.id} className={'py-3 text-left'}>
            {props.title && <h4 className={'mt-3 pb-2 font-sans text-xs uppercase text-black'}>{props.title}</h4>}
            <div>{props.children(props.data)}</div>
          </div>
        );
      })}
    </div>
  );
};
