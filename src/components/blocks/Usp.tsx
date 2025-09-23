'use client';

import { storyblokEditable } from '@storyblok/react';
import { type EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Usp } from '@/src/types/framework/storyblok-components';

const OPTIONS: EmblaOptionsType = { loop: true, breakpoints: { '(min-width: 961px)': { active: false } } };

const Usps: IStoryblok.FC<Usp> = ({ blok, ...props }) => {
  const [emblaRef] = useEmblaCarousel(OPTIONS, [Autoplay()]);

  return (
    <div
      {...props}
      className={'embla w-full bg-black text-white'}
      ref={emblaRef}
      {...storyblokEditable(blok)}
      data-test={'usp'}
    >
      <div
        className={
          'embla__container mx-auto h-16 w-full max-w-[140rem] lg:flex lg:h-16 lg:items-center lg:justify-between'
        }
      >
        {blok.uspItems?.map((usp) => {
          const uspIcon = usp?.icon?.filename ?? null;
          return (
            <div
              className={
                'embla__slide flex min-w-0 flex-[0_0_100%] items-center justify-center text-sm uppercase lg:flex-1'
              }
              key={uuidv4()}
            >
              {uspIcon && <Image height={18} width={18} src={uspIcon} alt={''} />}
              {usp.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Usps;
