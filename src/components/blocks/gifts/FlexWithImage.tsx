import Image from 'next/image';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type FlexWithImage, type Paragragh } from '@/src/types/framework/storyblok-components';

const FlexWithImageComponent: IStoryblok.FC<FlexWithImage> = ({ blok }) => {
  const { image, items } = blok;

  return (
    <div className={'bg-alabaster '}>
      <div className={'px-5 py-16 lg:px-10 xl:px-28'}>
        <div className={' grid grid-cols-1  gap-x-16 gap-y-6 md:grid-cols-2'}>
          {(items as Paragragh[])?.map((item) => (
            <div className={' space-y-8 font-light text-black/60'} key={item?._uid}>
              <p>{item?.content}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={'overflow-hidden xl:h-[37rem]'}>
        <Image
          src={image?.filename || '/images/efva-category-1920x1080.jpg'}
          alt={image?.alt || image?.title || image?.name || ''}
          width={1920}
          height={1080}
          className={'h-full  w-full object-cover'}
        />
      </div>
    </div>
  );
};

export default FlexWithImageComponent;
