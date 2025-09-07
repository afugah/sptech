'use client';

import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Faq } from '@/src/types/framework/storyblok-components';

const FaqComponent: IStoryblok.FC<Faq> = ({ blok }) => (
  <div className={'flex w-full flex-col items-center justify-between bg-creme p-10 max-md:w-full'}>
    <div className={'w-full text-left max-md:text-center'}>
      <div className={'mb-10 text-center text-xs uppercase'}>{blok.header}</div>

      <ul className={'flex flex-col gap-6'}>
        {blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
      </ul>
    </div>

    <div className={'mt-6 flex items-center justify-center'}>
      {blok?.footer?.map((button) => <StoryblokComponent blok={button} key={blok._uid} />)}
    </div>
  </div>
);

export default FaqComponent;
