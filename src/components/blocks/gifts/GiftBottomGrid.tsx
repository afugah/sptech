'use client';

import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type GiftBottomGrid, type GiftBottomItems } from '@/src/types/framework/storyblok-components';

const GiftBottomGridComponent: IStoryblok.FC<GiftBottomGrid> = ({ blok }) => {
  return (
    <div className={'mt-12 h-full bg-alabaster px-3 py-20 lg:px-10 xl:px-24'}>
      <div className={'grid gap-y-8 md:grid-cols-2 md:gap-6 md:gap-x-16'}>
        {(blok.items || []).map((item) => (
          <div key={item._uid}>
            <p className={'font-serif text-2xl font-medium'}>{item.mainTitle as string}</p>
            <div>
              {((item.blocks as GiftBottomItems[]) || []).map((block) => (
                <div key={block._uid} className={'mt-6'}>
                  <StoryblokComponent blok={block} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GiftBottomGridComponent;
