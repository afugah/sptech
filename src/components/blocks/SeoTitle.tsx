'use client';

import { storyblokEditable } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SeoTitle } from '@/src/types/framework/storyblok-components';

const SeoTitleComponent: IStoryblok.FC<SeoTitle> = ({ blok, ...props }) => {
  const { title } = blok;
  return (
    <div {...storyblokEditable(blok)} {...props}>
      <h6 className={`font-sans text-sm uppercase md:text-md`}>{title}</h6>
    </div>
  );
};

export default SeoTitleComponent;
