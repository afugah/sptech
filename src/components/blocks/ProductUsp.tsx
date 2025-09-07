'use client';

import { storyblokEditable } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ProductUsp } from '@/src/types/framework/storyblok-components';

const Usps: IStoryblok.FC<ProductUsp> = ({ blok, ...props }) => {
  // const { uspItems } = blok;
  return (
    <div {...props} className={''} {...storyblokEditable(blok)} data-test={'productUsp'}>
      <div className={'mx-auto h-16 w-full max-w-[140rem] lg:flex lg:h-16 lg:items-center lg:justify-between'}>
        {/* {uspItems?.map((usp) => {
          const uspIcon = usp?.icon?.filename ?? null;
          return (
            <div
              className={
                'embla__slide flex min-w-0 flex-[0_0_100%] items-center justify-center text-xs uppercase lg:flex-1'
              }
              key={uuidv4()}
            >
              {uspIcon && <Image height={18} width={18} src={uspIcon} alt={''} />}
              {usp.title}
            </div>
          );
        })} */}
      </div>
    </div>
  );
};

export default Usps;
