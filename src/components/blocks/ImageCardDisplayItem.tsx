'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';
import { gridImageHeightConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ImageCardDisplayItem } from '@/src/types/framework/storyblok-components';
import { isColorPicker, type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';

const ImageCardDisplayItemComponent: IStoryblok.FC<ImageCardDisplayItem> = ({ blok, ...props }) => {
  const { title, image, ctaButtons, description, imageHeight = 'medium', backgroundColor } = blok;

  return (
    <div key={blok._uid} className={'relative'} {...storyblokEditable(blok)} {...props}>
      <div className={'relative'}>
        {image?.filename && (
          <Image
            className={classNames('w-full object-cover', gridImageHeightConst[imageHeight])}
            height={500}
            width={600}
            src={image.filename}
            alt={image.alt || title || ''}
          />
        )}

        <div
          className={'absolute -bottom-20 left-1/2 w-11/12 -translate-x-1/2 bg-backgroundAlternative p-4'}
          style={
            backgroundColor && isColorPicker(backgroundColor)
              ? { backgroundColor: (backgroundColor as StoryblokColorPicker).value as string }
              : {}
          }
        >
          <h3 className={'mb-4 text-center text-2xl font-light uppercase'}>{title}</h3>
          {description && <p className={'mb-4 text-center font-light'}>{description}</p>}
          <div className={'flex justify-center'}>
            {ctaButtons && ctaButtons.map((button, index) => <StoryblokComponent blok={button} key={index} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCardDisplayItemComponent;
