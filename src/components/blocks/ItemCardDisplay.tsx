'use client';
import { StoryblokComponent } from '@storyblok/react';
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
import { sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ItemCardDisplay } from '@/src/types/framework/storyblok-components';
import { isColorPicker, type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
import TitleSubtitle from '../product/TitleSubtitle';
import { Card } from '../shadcn/card';

const ItemCardDisplayComponent: IStoryblok.FC<ItemCardDisplay> = ({ blok }) => {
  const { layoutMode, subtitle, subtitleColor, titleColor, titleSize, backgroundColor, title, itemsPerView, items } =
    blok;

  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];

  const titleSizeClass = (titleSize && sizeConst[titleSize]) || 'text-4xl sm:text-6xl  md:text-8xl lg:text-9xl';

  const getTitleColor =
    isColorPicker(titleColor) && (titleColor as StoryblokColorPicker)?.color
      ? (titleColor as StoryblokColorPicker)?.color
      : '#000000';
  const getSubtitleColor =
    isColorPicker(subtitleColor) && (subtitleColor as StoryblokColorPicker)?.color
      ? (subtitleColor as StoryblokColorPicker)?.color
      : '#ffffff';

  const getGridColsClass = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  if (layoutMode === 'grid') {
    return (
      <div className={cn('relative w-full px-2 py-8 xl:px-8', backgroundColorClass || 'bg-seashell')}>
        <TitleSubtitle
          title={title}
          subtitle={subtitle}
          titleColor={getTitleColor}
          subtitleColor={getSubtitleColor}
          titleSize={titleSizeClass}
        />

        <div className={`hidden w-full px-2  xl:block xl:px-2 `}>
          <div className={cn('grid gap-7 gap-y-14', getGridColsClass(Number(itemsPerView)))}>
            {(items as ItemCardDisplay[])?.length > 0 &&
              (items as ItemCardDisplay[])?.map((item) => (
                <Card key={item?._uid} className={'overflow-hidden rounded-none border-none  shadow-none'}>
                  <StoryblokComponent blok={item} backgroundColor={backgroundColorClass} />
                </Card>
              ))}
          </div>
        </div>
        <div className={' block xl:hidden'}>
          <Carousel
            className={cn('w-full bg-transparent px-0 md:px-4')}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
            }}
          >
            <div className={'px-3'}>
              <CarouselContent className={'-ml-2 bg-transparent'}>
                {(items as ItemCardDisplay[])?.length > 0 &&
                  (items as ItemCardDisplay[])?.map((item) => (
                    <CarouselItem key={item?._uid} className={'pl-2 md:basis-[50%] md:pl-6 '}>
                      <Card className={`overflow-hidden rounded-none border-none shadow-none ${backgroundColor}`}>
                        <StoryblokComponent blok={item} backgroundColor={backgroundColorClass} />
                      </Card>
                    </CarouselItem>
                  ))}
              </CarouselContent>

              <CarouselPrevious className={'hidden xl:flex'} />
              <CarouselNext className={'hidden xl:flex'} />
            </div>
            <CarouselDots className={'xl:hidden'} />
          </Carousel>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full py-8', backgroundColorClass || 'bg-seashell')}>
      <TitleSubtitle
        title={title}
        subtitle={subtitle}
        titleColor={getTitleColor}
        subtitleColor={getSubtitleColor}
        titleSize={titleSizeClass}
      />
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
            {(items as ItemCardDisplay[])?.length > 0 &&
              (items as ItemCardDisplay[])?.map((item) => (
                <CarouselItem key={item?._uid} className={'pl-2 md:basis-1/2 md:pl-6 lg:basis-[33.5%]'}>
                  <Card className={`overflow-hidden rounded-none border-none shadow-none ${backgroundColor}`}>
                    <StoryblokComponent blok={item} backgroundColor={backgroundColorClass} />
                  </Card>
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
export default ItemCardDisplayComponent;
