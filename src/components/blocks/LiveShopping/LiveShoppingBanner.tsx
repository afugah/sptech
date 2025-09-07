'use client';

import Image from 'next/image';
import React, { useEffect } from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type LiveShoppingBanner } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import { Button } from '../../ui/Button';

const LiveShoppingBannerComponent: IStoryblok.FC<LiveShoppingBanner> = ({ blok }) => {
  const { showId, description, image, title, _uid, showButtonText } = blok;
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
  }, [_uid, showId]);

  return (
    <div className={'flex flex-col justify-start gap-4 md:flex-row md:gap-24'}>
      <div className={'basis-1/1 md:basis-1/2'}>
        {(image as StoryblokImage)?.filename && (
          <Image alt={'live-shopping-banner'} src={(image as StoryblokImage).filename || ''} width={960} height={600} />
        )}
      </div>
      <div className={'basis-1/1 my-auto flex flex-col gap-y-4 md:basis-1/3'}>
        <h2 className={'text-xl md:text-2xl'}>{title}</h2>
        <p className={'text-sm'}>{description}</p>
        <div className={'mx-auto mt-2'} id={showId}>
          <Button>{showButtonText}</Button>
          {/* {button && button?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)} */}
        </div>
      </div>
    </div>
  );
};

export default LiveShoppingBannerComponent;
