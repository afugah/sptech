'use client';

import { StoryblokComponent } from '@storyblok/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type HorizontalScrollGridCard } from '@/src/types/framework/storyblok-components';
import { type StoryblokContent } from '@/src/types/framework/storyblok-helpers';

export const HorizontalScrollGridCardBlok: IStoryblok.FC<HorizontalScrollGridCard> = ({ blok }) => {
  const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => (
      <div className={'bg-gray-100 flex h-full items-center justify-center'}>
        <div className={'h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900'}></div>
      </div>
    ),
  });
  return (
    <div className={'relative h-full w-full'}>
      {(blok.vimeo as StoryblokContent)?.vimeo_raw ? (
        <ReactPlayer
          url={(blok.vimeo as StoryblokContent)?.vimeo_raw as string}
          playsinline={true}
          width={'100%'}
          height={'100%'}
          muted={true}
          loop={true}
          controls={false}
          playing
          className={'absolute left-0 top-0 z-0 object-cover'}
        />
      ) : blok.image && blok.image.filename ? (
        <Image
          src={blok.image.filename}
          alt={blok.image.alt || blok.image.filename || ''}
          fill
          priority={true}
          title={blok.image.title || blok.image.filename}
          sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={'absolute left-0 top-0 z-0 object-cover'}
        />
      ) : null}

      <div className={'relative flex h-full w-full flex-col items-center justify-end gap-4 px-2 pb-10 pt-4'}>
        {blok.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
      </div>
    </div>
  );
};
