'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import { useIdentification } from '@/src/context/identificationContext';
import {
  desktopBannerGapConst,
  desktopColumnsConst,
  desktopGridWidthConst,
  desktopRowConst,
  marginBottomConst,
  marginTopConst,
  mobileBannerGapConst,
  mobileColumnsConst,
  mobileGridWidthConst,
  mobileRowConst,
} from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type BannerGrid, type StoryblokSlider } from '@/src/types/framework/storyblok-components';
import { displayForMember } from '@/src/util/displayForMemeber';

const BannerGridComponent: IStoryblok.FC<BannerGrid> = ({ blok }) => {
  const {
    desktopColumns,
    desktopRows,
    desktopGap,
    desktopGridWidth,

    mobileColumns,
    mobileRows,
    mobileGap,
    mobileGridWidth,

    marginTop,
    marginBottom,
    memberLevel,
    Format,
  } = blok;

  const numberOfBlocks = blok?.blocks?.length ?? 0;

  const gridClasses = classNames(
    desktopColumnsConst[(desktopColumns as StoryblokSlider)?.value],
    desktopRowConst[(desktopRows as StoryblokSlider)?.value],
    desktopBannerGapConst[(desktopGap as StoryblokSlider)?.value],
    desktopGridWidthConst[desktopGridWidth!],

    mobileColumnsConst[(mobileColumns as StoryblokSlider)?.value],
    mobileRowConst[(mobileRows as StoryblokSlider)?.value],
    mobileBannerGapConst[(mobileGap as StoryblokSlider)?.value],
    mobileGridWidthConst[mobileGridWidth!],

    marginTopConst[(marginTop as StoryblokSlider)?.value],
    marginBottomConst[(marginBottom as StoryblokSlider)?.value],
    'grid',
  );

  const { getTokenPayload } = useIdentification();
  const customerMemberLevel = getTokenPayload()?.memberLevel;
  const shouldDisplayBlock = displayForMember(memberLevel, customerMemberLevel ?? '');

  if (shouldDisplayBlock) {
    return (
      <div className={gridClasses} {...storyblokEditable(blok)} data-test={'bannerGrid'}>
        {blok?.blocks?.map((block) => {
          return <StoryblokComponent blok={block} key={block._uid} numberOfBlocks={numberOfBlocks} format={Format} />;
        })}
      </div>
    );
  }

  return null;
};

export default BannerGridComponent;
