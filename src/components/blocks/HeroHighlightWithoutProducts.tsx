'use client';

import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import { sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type HeroHighlight, type StoryblokColorPicker } from '@/src/types/framework/storyblok-components';
import { isColorPicker } from '@/src/types/framework/storyblok-helpers';
import TitleSubtitle from '../product/TitleSubtitle';

const HeroHighlightWithoutProducts: IStoryblok.FC<HeroHighlight> = ({ blok }) => {
  const { title, titleSize, backgroundColor, titleColor, subtitleColor, subtitle, blocks, image } = blok;

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
  const titleSizeClass = sizeConst[titleSize as string] || 'text-4xl sm:text-6xl  md:text-8xl lg:text-9xl';

  return (
    <div className={cn('relative px-4 pb-10', backgroundColorClass || 'bg-seashell')}>
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
            className={cn('h-auto w-full object-cover object-center md:h-[20rem] lg:h-[17rem]')}
          />
        </div>

        <div className={'w-full lg:w-1/2'}>
          <div className={'pb-8 pt-3 text-center font-light leading-7 tracking-widest lg:px-20 lg:pb-10 lg:text-left'}>
            {/* <p className={'w-full'}>{text}</p> */}
            {!!blocks?.length && (
              <div className={''}>
                {blok.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeroHighlightWithoutProducts;
