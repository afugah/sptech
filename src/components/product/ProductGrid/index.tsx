'use client';

import React from 'react';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { Skeleton } from '../../shadcn/skeleton';
import { ProductGridStatic } from './ProductGridStatic';

interface IProductGridProps {
  productList: ICollectionItem[];
  isLoading?: boolean;
}

const SearchGridSkeleton = () => (
  <div className={'mb-3 grid w-full grid-cols-2  items-center gap-3 lg:grid-cols-4 lg:gap-6'}>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className={'space-y-2'}>
        <Skeleton className={'aspect-square w-full'} />
        <div className={'space-y-1'}>
          <Skeleton className={'h-4 w-full'} />
          <Skeleton className={'h-3 w-3/4'} />
        </div>
      </div>
    ))}
  </div>
);

export const ProductGrid = ({ isLoading, productList }: IProductGridProps) => {
  return (
    <div className={'mb-4'}>
      {isLoading && <SearchGridSkeleton />}

      <ProductGridStatic productList={productList} />
    </div>
  );
};
