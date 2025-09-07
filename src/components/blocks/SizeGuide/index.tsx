'use client';

import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SizeGuide } from '@/src/types/framework/storyblok-components';

const SizeGuideComponent: IStoryblok.FC<SizeGuide> = ({ blok }) => (
  <div className={'flex h-full w-full flex-col justify-between px-10'}>
    <div className={'flex w-full flex-col gap-y-2.5'}>
      {blok?.settings?.map((setting) => <StoryblokComponent blok={setting} key={setting._uid} />)}
    </div>
    {blok?.button?.map((btn) => <StoryblokComponent blok={btn} key={btn._uid} />)}
  </div>
);

export default SizeGuideComponent;
