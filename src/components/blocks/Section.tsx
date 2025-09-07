'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import {
  alignConst,
  gridHorizontalPaddingConst,
  gridSpacingDesktopConst,
  gridSpacingMobileConst,
  sectionBackgroundColorConst,
  sectionWidthConst,
} from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Section } from '@/src/types/framework/storyblok-components';
import { isSlider, safeString } from '@/src/types/framework/storyblok-helpers';

const SectionComponent: IStoryblok.FC<Section> = ({ blok }) => {
  const {
    align = 'left',
    backgroundColor,
    width,
    verticalSpacing = 'none',
    mobileHorizontalPadding = 'none',
    desktopHorizontalPadding = 'none',
  } = blok;

  const gridClasses = classNames(
    alignConst[align],
    backgroundColor && isSlider(backgroundColor) ? sectionBackgroundColorConst[safeString(backgroundColor.value)] : '',
    width && sectionWidthConst[width] ? sectionWidthConst[width] : 'w-full',
    verticalSpacing && verticalSpacing !== 'none'
      ? `${gridSpacingMobileConst[verticalSpacing]} ${gridSpacingDesktopConst[verticalSpacing]}`
      : '',
    mobileHorizontalPadding && mobileHorizontalPadding !== 'none'
      ? gridHorizontalPaddingConst[mobileHorizontalPadding]?.split(' ')[0]
      : 'px-0',
    desktopHorizontalPadding && desktopHorizontalPadding !== 'none'
      ? gridHorizontalPaddingConst[desktopHorizontalPadding]?.split(' ')[1]
      : 'md:px-0',
    'relative',
  );

  return (
    <div className={gridClasses} {...storyblokEditable(blok)} data-test={'section'}>
      {blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
    </div>
  );
};

export default SectionComponent;
