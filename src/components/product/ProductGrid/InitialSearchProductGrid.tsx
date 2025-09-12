import React from 'react';
import { Skeleton } from '@/src/components/shadcn/skeleton';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import ProductCard from '../ProductCard';

interface InitialSearchProductGridStaticProps {
  productList: ICollectionItem[];
  isLoading?: boolean;
}

const SearchGridSkeleton = () => (
  <div className={'mb-3 grid w-full grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6'}>
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

export const InitialSearchProductGridStatic: React.FC<InitialSearchProductGridStaticProps> = ({
  productList,
  isLoading = false,
}) => {
  const limitedProducts = productList.slice(0, 4);

  if (isLoading) {
    return <SearchGridSkeleton />;
  }

  // Limit to first 4 products for initial search display

  return (
    <div className={'mb-3 grid w-full grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6'}>
      {limitedProducts.map((product) => (
        <ProductCard key={product.id} product={product} variant={'search'} />
      ))}
    </div>
  );
};
