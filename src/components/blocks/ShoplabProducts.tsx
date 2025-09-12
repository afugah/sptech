'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/shadcn/carousel';
import { useFindifyProducts } from '@/src/hooks/useFindifyProducts';
import { sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ShoplabProducts, type StoryblokColorPicker } from '@/src/types/framework/storyblok-components';
import { isColorPicker } from '@/src/types/framework/storyblok-helpers';
import ProductCard from '../product/ProductCard';
import TitleSubtitle from '../product/TitleSubtitle';

const ShoplabProductsComponent: IStoryblok.FC<ShoplabProducts> = ({ blok }) => {
  const {
    title,
    background,
    newTitleColor,
    titleSize,
    backgroundColor,
    itemsPerView,
    products,
    findifyProducts,
    layoutMode,
  } = blok;

  const ItemCount = Number(itemsPerView) || 4;

  const { products: findifyProductsData, isLoading: isLoadingFindify } = useFindifyProducts(
    findifyProducts as string,
    ItemCount as number | undefined,
  );

  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];

  const getTitleColor =
    isColorPicker(newTitleColor) && (newTitleColor as StoryblokColorPicker)?.color
      ? (newTitleColor as StoryblokColorPicker)?.color
      : '#000000';

  const titleSizeClass = (titleSize && sizeConst[titleSize]) || 'text-4xl sm:text-6xl  md:text-8xl lg:text-9xl';
  const checLayoutMode = itemsPerView && (Number(itemsPerView) as number) < 4 ? 'grid' : layoutMode || 'grid';
  type ProductItem = { image: string; name: string; id: string; price: string; product_sku: string };
  const productsData = products as { items?: ProductItem[] } | undefined;

  // Background logic: if backgroundImage exists, use backgroundColor; otherwise use backgroundImage
  const hasBackgroundImage = background?.filename;
  const backgroundStyle =
    hasBackgroundImage && !backgroundColorClass ? { backgroundImage: `url(${background.filename})` } : {};
  const finalBackgroundClass =
    backgroundColor && !hasBackgroundImage
      ? backgroundColorClass
      : !backgroundColorClass && !hasBackgroundImage
        ? 'bg-white'
        : 'bg-transparent';

  // Determine if we should use Findify products or default products
  const shouldUseFindifyProducts = findifyProducts && findifyProductsData.length > 0;
  const defaultProducts = productsData?.items;

  const getGridColsClass = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  if (checLayoutMode === 'carousel') {
    return (
      <div style={backgroundStyle} className={cn('relative w-full py-2', finalBackgroundClass || 'bg-seashell')}>
        <TitleSubtitle title={title} titleColor={getTitleColor} titleSize={titleSizeClass} />
        {(shouldUseFindifyProducts || (defaultProducts && defaultProducts.length > 0)) && !isLoadingFindify && (
          <Carousel
            className={cn('w-full bg-transparent px-9 md:px-14')}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
            }}
          >
            <div className={'px-3'}>
              <CarouselContent className={'-ml-2 bg-transparent lg:-ml-1'}>
                {shouldUseFindifyProducts
                  ? findifyProductsData.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                      >
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))
                  : defaultProducts?.map(
                      (product: { image: string; name: string; id: string; price: string; product_sku: string }) =>
                        product && (
                          <CarouselItem
                            key={product.id}
                            className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                          >
                            <ProductCard
                              product={{
                                ...product,
                                id: product.product_sku || product.id,
                                subtitle: product.product_sku,
                              }}
                              variant={'storyblok'}
                            />
                          </CarouselItem>
                        ),
                    )}
              </CarouselContent>

              <CarouselPrevious className={'hidden lg:flex'} />
              <CarouselNext className={'hidden lg:flex'} />
            </div>

            <CarouselDots className={'ml-4 flex w-full justify-start lg:hidden'} />
          </Carousel>
        )}
      </div>
    );
  }

  return (
    <div style={backgroundStyle} className={cn('relative w-full py-2', finalBackgroundClass || 'bg-seashell')}>
      <TitleSubtitle title={title} titleColor={getTitleColor} titleSize={titleSizeClass} />
      {(shouldUseFindifyProducts || (defaultProducts && defaultProducts.length > 0)) && !isLoadingFindify && (
        <div className={`hidden w-full lg:block`}>
          <div className={cn('grid gap-2 gap-y-2', getGridColsClass(Number(itemsPerView)))}>
            {shouldUseFindifyProducts
              ? findifyProductsData.map((product) => (
                  <div key={product.id} className={''}>
                    <ProductCard product={product} />
                  </div>
                ))
              : defaultProducts?.map(
                  (product: { image: string; name: string; id: string; price: string; product_sku: string }) =>
                    product && (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          id: product.product_sku || product.id,
                          subtitle: product.product_sku,
                        }}
                        variant={'storyblok'}
                      />
                    ),
                )}
          </div>
        </div>
      )}
      <div className={'block lg:hidden'}>
        {(shouldUseFindifyProducts || (defaultProducts && defaultProducts.length > 0)) && !isLoadingFindify && (
          <Carousel
            className={cn('w-full bg-transparent px-0 md:px-0')}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
            }}
          >
            <div className={'px-3'}>
              <CarouselContent className={'-ml-2 bg-transparent'}>
                {shouldUseFindifyProducts
                  ? findifyProductsData.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                      >
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))
                  : defaultProducts?.map(
                      (product: { image: string; name: string; id: string; price: string; product_sku: string }) =>
                        product && (
                          <CarouselItem
                            key={product.id}
                            className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                          >
                            <ProductCard
                              product={{
                                ...product,
                                id: product.product_sku || product.id,
                                subtitle: product.product_sku,
                              }}
                              variant={'storyblok'}
                            />
                          </CarouselItem>
                        ),
                    )}
              </CarouselContent>

              <CarouselPrevious className={'hidden lg:flex'} />
              <CarouselNext className={'hidden lg:flex'} />
            </div>

            <CarouselDots className={' lg:hidden'} />
          </Carousel>
        )}
      </div>
    </div>
  );
};
export default ShoplabProductsComponent;
