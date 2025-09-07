'use client';

import Image from 'next/image';
import React, { useEffect } from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type LiveShoppingCard } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';

const LiveShoppingCardComponent: IStoryblok.FC<LiveShoppingCard> = ({ blok }) => {
  const { image, description, title, showId } = blok;
  useEffect(() => {
    if (!window.initBambuserLiveShopping) {
      window.initBambuserLiveShopping = function (item: unknown) {
        window.initBambuserLiveShopping.queue.push(item);
      };

      window.initBambuserLiveShopping.queue = [];
    }
    window.initBambuserLiveShopping({
      showId: showId,
      node: document.getElementById(showId),
      type: 'overlay',
    });
  }, [showId]);
  return (
    <div
      className={
        'group relative flex cursor-pointer flex-col gap-y-3 opacity-80 duration-200 ease-in-out hover:opacity-100'
      }
      id={showId}
    >
      {(image as StoryblokImage)?.filename && (
        <Image alt={'live-shopping-card'} src={(image as StoryblokImage).filename || ''} width={640} height={800} />
      )}
      <h3 className={'px-3 text-sm md:px-0 md:text-xl'}>{title}</h3>
      <p className={'hidden text-sm md:block'}>{description}</p>
      <div
        className={
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-70 transition-opacity duration-300 ease-in-out group-hover:opacity-100'
        }
      >
        <svg xmlns={'http://www.w3.org/2000/svg'} width={'68'} height={'68'} viewBox={'0 0 24 24'} fill={'white'}>
          <circle cx={'12'} cy={'12'} r={'12'} fill={'rgba(0, 0, 0, 0.7)'} />
          <path d={'M8 5v14l11-7z'} />
        </svg>
      </div>
    </div>
  );
};

export default LiveShoppingCardComponent;
