'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import {
  gridGapDesktopConst,
  gridGapMobileConst,
  gridHorizontalPaddingConst,
  gridSpacingDesktopConst,
  gridSpacingMobileConst,
} from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Grid } from '@/src/types/framework/storyblok-components';

const GridComponent: IStoryblok.FC<Grid> = ({ blok, ...props }) => {
  const {
    mobileColumns,
    desktopColumns,
    mobileGap = 'md',
    desktopGap = 'md',
    mobileVerticalSpacing = 'md',
    desktopVerticalSpacing = 'md',
    horizontalPadding = 'md',
  } = blok;

  const gridClasses = classNames(
    'grid relative w-full max-w-[180rem] mx-auto',
    `grid-cols-${mobileColumns}`,
    `md:grid-cols-${desktopColumns}`,
    mobileGap ? gridGapMobileConst[mobileGap] : 'gap-8',
    desktopGap ? gridGapDesktopConst[desktopGap] : 'md:gap-12',
    mobileVerticalSpacing && mobileVerticalSpacing !== 'md' ? gridSpacingMobileConst[mobileVerticalSpacing] : 'py-12',
    desktopVerticalSpacing && desktopVerticalSpacing !== 'md'
      ? gridSpacingDesktopConst[desktopVerticalSpacing]
      : 'md:py-16',
    horizontalPadding ? gridHorizontalPaddingConst[horizontalPadding] : 'px-6 md:px-8',
  );

  return (
    <div className={gridClasses} {...storyblokEditable(blok)} data-test={'grid'} {...props}>
      {blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
    </div>
  );
};
export default GridComponent;
