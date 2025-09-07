'use client';
import React from 'react';
import { CarouselItem } from '@/src/components/shadcn/carousel';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { CarouselComponent } from '../carousel/carousel';
import { useSearchProduct } from '../search/dropdown-search/components/useSearchProduct';
import InitialSearchProductCard from './InitialSearchProductCard';

const DefaultProductsInCarousel = () => {
  const defaultFilters: ICollectionSearch.Filter = {
    size: [],
    color: [],
    brand: [],
    category: [],
    price: {
      min: 0,
      max: 50000,
    },
  };

  const defaultSort: ICollectionSearch.Sort = {
    field: '',
    order: 'asc',
  };

  const { productList } = useSearchProduct({
    q: '',
    defaultSort,
    defaultFilters,
    initialPage: 1,
  });
  return (
    <CarouselComponent>
      {productList?.map((product) => (
        <CarouselItem key={product.key} className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}>
          <InitialSearchProductCard product={product} />
        </CarouselItem>
      ))}
    </CarouselComponent>
  );
};

export default DefaultProductsInCarousel;
