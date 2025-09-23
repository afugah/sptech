'use client';

import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import { useFindifyProducts } from '@/src/hooks/useFindifyProducts';
import { sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import {
  type HeroHighlight as HeroHighlightStoryblok,
  type StoryblokColorPicker,
} from '@/src/types/framework/storyblok-components';
import { isColorPicker } from '@/src/types/framework/storyblok-helpers';
import { CarouselComponent } from '../carousel/carousel';
import ProductCard from '../product/ProductCard';
import TitleSubtitle from '../product/TitleSubtitle';
import { CarouselItem } from '../shadcn/carousel';

const HeroHighlight: IStoryblok.FC<HeroHighlightStoryblok> = ({ blok }) => {
  const {
    title,
    titleSize,
    backgroundColor,
    titleColor,
    subtitleColor,
    subtitle,
    blocks,
    image,
    products,
    findifyProducts,
    itemCount,
  } = blok;

  const { products: findifyProductsData, isLoading: isLoadingFindify } = useFindifyProducts(
    findifyProducts as string,
    itemCount as number | undefined,
  );

  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];

  const getTitleColor =
    isColorPicker(titleColor) && (titleColor as StoryblokColorPicker)?.color
      ? (titleColor as StoryblokColorPicker)?.color
      : '#000000';
  const getSubtitleColor =
    isColorPicker(subtitleColor) && (subtitleColor as StoryblokColorPicker)?.color
      ? (subtitleColor as StoryblokColorPicker)?.color
      : '#ffffff';
  const titleSizeClass =
    (titleSize && sizeConst[titleSize as string]) || 'text-4xl sm:text-6xl  md:text-8xl lg:text-9xl';

  const productsData = products as
    | { items?: Array<{ image: string; name: string; id: string; price: string; product_sku: string }> }
    | undefined;

  // Determine if we should use Findify products or default products
  const shouldUseFindifyProducts = findifyProducts && findifyProductsData.length > 0;
  const defaultProducts = productsData?.items;

  return (
    <div className={cn('relative px-4', backgroundColorClass || 'bg-seashell')}>
      <TitleSubtitle
        title={title}
        subtitle={subtitle}
        titleColor={getTitleColor}
        subtitleColor={getSubtitleColor}
        titleSize={titleSizeClass}
      />
      <div className={'flex flex-wrap'}>
        <div className={' w-full lg:w-1/2'}>
          <Image
            src={image?.filename || ''}
            alt={image?.alt || image?.title || image?.name || ''}
            width={500}
            height={1000}
            quality={60}
            className={cn(
              'h-auto w-full',
              productsData?.items && productsData.items.length > 1 && 'object-cover object-center lg:h-[30rem]',
            )}
          />
        </div>

        <div className={'w-full lg:w-1/2'}>
          <div className={'pb-8 pt-3 text-center font-light leading-7 lg:px-20 lg:pb-10 lg:text-left'}>
            {!!blocks?.length && (
              <div className={''}>
                {blok.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      {(shouldUseFindifyProducts || (defaultProducts && defaultProducts.length > 0)) && !isLoadingFindify && (
        <div className={' w-full pb-20 pt-4  lg:-mt-52 lg:w-full'}>
          <div className={''}>
            <CarouselComponent className={' w-full   lg:ml-auto lg:w-[65%] '}>
              {shouldUseFindifyProducts
                ? findifyProductsData.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[50%]'}
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))
                : defaultProducts?.map((product) => (
                    <CarouselItem
                      key={product.product_sku || product.id}
                      className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[50%]'}
                    >
                      <ProductCard
                        product={{ ...product, id: product.product_sku || product.id, subtitle: product.product_sku }}
                        variant={'storyblok'}
                      />
                    </CarouselItem>
                  ))}
            </CarouselComponent>
            {/* <HorizontalScrollGrid
              scrollPercentage={blok.scrollPercentage ? +blok.scrollPercentage : undefined}
              height={blok.height ? +blok.height : undefined}
              elementWidth={blok.elementWidth ? +blok.elementWidth : undefined}
            >
              {products?.items?.map(
                (item: { image: string; name: string; id: string; price: string; product_sku: string }) => (
                  <StoryblokProductCard key={item?.product_sku || item?.id} product={{ ...item, id: item?.product_sku || item?.id }} />
                ),
              )}
            </HorizontalScrollGrid> */}
          </div>
        </div>
      )}
    </div>
  );
};
export default HeroHighlight;
