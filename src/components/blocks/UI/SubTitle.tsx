'use client';

import { storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import { fontConst, fontWeightConst, opacityConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SubTitle } from '@/src/types/framework/storyblok-components';
import { isColorPicker, isSlider, type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';

const SubTitleComponent: IStoryblok.FC<SubTitle> = ({ blok }) => {
  const { title, type, size = 'medium', font = 'base', opacity, fontWeight, colorPicker } = blok;

  const Tag: React.ElementType = type || 'h3';

  const colorPickerData = isColorPicker(colorPicker) ? colorPicker : null;
  const opacityData = isSlider(opacity) ? opacity : null;

  const subTitleClasses = classNames(
    sizeConst[size],
    fontWeightConst[fontWeight || '400'],
    (colorPickerData as StoryblokColorPicker)?.color ? '' : 'text-white',
    opacityConst[(opacityData?.value as keyof typeof opacityConst) || 100],
    fontConst[font],
  );

  return (
    <Tag
      className={subTitleClasses}
      {...storyblokEditable(blok)}
      key={blok._uid}
      data-test={'subTitle'}
      style={
        (colorPickerData as StoryblokColorPicker)?.color
          ? { color: (colorPickerData as StoryblokColorPicker).color }
          : {}
      }
    >
      {title}
    </Tag>
  );
};

export default SubTitleComponent;
