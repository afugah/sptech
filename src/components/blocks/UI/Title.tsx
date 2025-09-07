'use client';

import { storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import {
  fontConst,
  fontWeightConst,
  marginBottomConst,
  opacityConst,
  sizeConst,
  titleWidthConst,
} from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Title } from '@/src/types/framework/storyblok-components';
import { type StoryblokColorPicker, type StoryblokSlider } from '@/src/types/framework/storyblok-helpers';

const TitleComponent: IStoryblok.FC<Title> = ({ blok }) => {
  const {
    title,
    type,
    size = 'medium',
    font = 'base',
    opacity,
    shadow,
    marginBottom,
    fontWeight,
    colorPicker,
    width,
  } = blok;

  const Tag: React.ElementType = type || 'h1';

  // Safely cast and access properties
  const colorPickerTyped = colorPicker as StoryblokColorPicker | undefined;
  const opacityTyped = opacity as StoryblokSlider | undefined;
  const marginBottomTyped = marginBottom as StoryblokSlider | undefined;

  const titleClasses = classNames(
    sizeConst[size],
    colorPickerTyped?.color ? '' : 'text-white',
    opacityTyped?.value && typeof opacityTyped.value === 'number' ? opacityConst[opacityTyped.value] : undefined,
    fontConst[font],
    fontWeightConst[fontWeight || '400'],
    shadow ? 'drop-shadow-md' : '',
    marginBottomTyped?.value && typeof marginBottomTyped.value === 'number'
      ? marginBottomConst[marginBottomTyped.value]
      : undefined,
    titleWidthConst[width as string] || 'w-full',
  );

  return (
    <Tag
      className={titleClasses}
      {...storyblokEditable(blok)}
      key={blok._uid}
      data-test={'title'}
      style={colorPickerTyped?.color ? { color: colorPickerTyped.color } : {}}
    >
      {title}
    </Tag>
  );
};

export default TitleComponent;
