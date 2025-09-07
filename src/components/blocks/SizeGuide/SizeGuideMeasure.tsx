'use client';

import Image from 'next/image';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SizeGuideMeasure } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import { CollapseRounded } from '../../ui/CollapseRounded';

const SizeGuideMeasureComponent: IStoryblok.FC<SizeGuideMeasure> = ({ blok }) => {
  const { measureImage, title, items } = blok;
  return (
    <CollapseRounded titleClassName={'text-black text-sm'} title={title}>
      <div className={'flex flex-row items-center gap-10 py-6 lg:flex-row'}>
        <div className={'flex w-full flex-col gap-6 lg:w-1/2'}>
          {items?.map((item) => (
            <div className={'flex items-center gap-4'} key={item._uid}>
              <div
                className={
                  'flex min-h-8 min-w-8 items-center justify-center rounded-full border bg-black text-sm font-bold text-white'
                }
              >
                {item.logoText}
              </div>
              <div>
                <p className={'text-sm'}> {item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={'flex w-full justify-center lg:w-1/2'}>
          <div className={'relative'}>
            {(measureImage as StoryblokImage)?.filename && (
              <Image
                src={(measureImage as StoryblokImage).filename || ''}
                width={200}
                height={200}
                alt={'Measurement Silhouette'}
              />
            )}
          </div>
        </div>
      </div>
    </CollapseRounded>
  );
};

export default SizeGuideMeasureComponent;
