'use client';

import { StoryblokComponent } from '@storyblok/react';
import { storyblokEditable } from '@storyblok/react';
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
import { sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ShoplabCollections, type StoryblokPalette } from '@/src/types/framework/storyblok-components';
import TitleSubtitle from '../product/TitleSubtitle';

const ShoplabCollectionsComponent: IStoryblok.FC<ShoplabCollections> = ({ blok }) => {
  const { title, collections, backgroundColor, titleColor, subtitleColor, titleSize, subtitle, collectionTitleColor } =
    blok;

  const titleText = Array.isArray(title) && title.length > 0 && title[0]?.text ? title[0].text : title;
  const titleSizeClass = (titleSize && sizeConst[titleSize]) || 'text-8xl lg:text-9xl';

  return (
    <div
      className={cn('relative w-full px-2 py-10')}
      style={{ backgroundColor: (backgroundColor as { value?: string })?.value || '#e7e5e4' }}
      {...storyblokEditable(blok)}
    >
      <TitleSubtitle
        title={titleText}
        subtitle={subtitle}
        titleColor={(titleColor as { value?: string })?.value || '#000000'}
        subtitleColor={(subtitleColor as { value?: string })?.value || '#000000'}
        titleSize={titleSizeClass}
        hideTitleOnMobile
      />

      <div className={'block lg:hidden'}>
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
              {collections?.map((item) => (
                <CarouselItem key={item._uid} className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6'}>
                  <StoryblokComponent blok={item} titleColor={(collectionTitleColor as StoryblokPalette).value} />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className={'hidden lg:flex'} />
            <CarouselNext className={'hidden lg:flex'} />

            <CarouselDots className={'flex w-full justify-center pt-4 lg:hidden'} />
          </div>
        </Carousel>
      </div>

      <div className={'hidden lg:block'}>
        <Carousel
          className={cn('w-full bg-transparent')}
          opts={{
            align: 'start',
            loop: false,
            slidesToScroll: 1,
          }}
        >
          <div className={'px-12'}>
            <CarouselContent className={'-ml-2 bg-transparent'}>
              {collections?.map((item) => (
                <CarouselItem
                  key={item._uid}
                  className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                >
                  <StoryblokComponent blok={item} titleColor={(collectionTitleColor as StoryblokPalette).value} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={'hidden lg:flex'} />
            <CarouselNext className={'hidden lg:flex'} />
          </div>
          <CarouselDots className={'flex w-full justify-center lg:hidden'} />
        </Carousel>
      </div>
    </div>
  );
};

export default ShoplabCollectionsComponent;
