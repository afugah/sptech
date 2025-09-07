'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/shadcn/carousel';
import { sectionBackgroundColorConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ProductCardDisplay } from '@/src/types/framework/storyblok-components';
import { isColorPicker, type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
import StoryblokProductCard from '../product/StoryblokProductCard';

const ProductCardDisplayComponent: IStoryblok.FC<ProductCardDisplay> = ({ blok }) => {
  const { layoutMode, backgroundColor, title, itemsPerView, products } = blok;

  // Type guard for products
  type ProductItem = { image: string; name: string; id: string; price: string; product_sku: string };
  const productsData = products as { items?: ProductItem[] } | undefined;

  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];
  const getGridColsClass = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  if (layoutMode === 'grid') {
    return (
      <div className={cn('w-full px-12 py-8', backgroundColorClass || '')}>
        {title && (
          <div className={'mb-16 text-center'}>
            <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{title}</h3>
          </div>
        )}
        <div className={cn('grid gap-7', getGridColsClass(Number(itemsPerView)))}>
          {productsData?.items &&
            productsData.items.length > 0 &&
            productsData.items.map((product) => (
              <div key={product.product_sku || product.id} className={''}>
                <StoryblokProductCard
                  product={{ ...product, id: product.product_sku || product.id, subtitle: product.product_sku }}
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full py-8', backgroundColorClass || '')}>
      {title && (
        <div className={'mb-16 text-center'}>
          <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{title}</h3>
        </div>
      )}
      <Carousel
        className={cn('w-full bg-transparent px-9 md:px-14')}
        opts={{
          align: 'start',
          loop: false,
          slidesToScroll: 1,
        }}
      >
        <div className={'px-3'}>
          <CarouselContent className={'-ml-1 bg-transparent'}>
            {productsData?.items &&
              productsData.items.length > 0 &&
              productsData.items.map((product) => (
                <CarouselItem
                  key={product.product_sku || product.id}
                  className={'pl-2 md:basis-1/2 md:pl-6 lg:basis-[25%]'}
                >
                  <StoryblokProductCard
                    product={{ ...product, id: product.product_sku || product.id, subtitle: product.product_sku }}
                  />
                </CarouselItem>
              ))}
          </CarouselContent>

          <CarouselPrevious className={'hidden md:flex'} />
          <CarouselNext className={'hidden md:flex'} />
        </div>
        <CarouselDots className={'md:hidden'} />
      </Carousel>
    </div>
  );
};
export default ProductCardDisplayComponent;
