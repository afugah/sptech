'use client';

import ArrowIcon from '@images/icons/arrow-right-white.svg';
import { storyblokEditable } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Hero } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import Confetti from '../ui/Confetti';

const placementClasses: { [key: string]: string } = {
  'top-left': 'top-8 left-8 lg:top-16 lg:left-16',
  'top-right': 'top-8 right-8 lg:top-16 lg:right-16',
  'top-center': 'top-8 left-1/2 transform -translate-x-1/2 lg:top-16',
  'middle-center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  'middle-left': 'top-1/2 left-8 transform -translate-y-1/2 lg:left-16',
  'middle-right': 'top-1/2 right-8 transform -translate-y-1/2 lg:right-16',
  'bottom-left': 'bottom-32 left-8 lg:bottom-20 lg:left-16',
  'bottom-center': 'bottom-32 left-1/2 transform -translate-x-1/2 lg:bottom-20',
  'bottom-right': 'bottom-32 right-8 lg:bottom-20 lg:right-16',
};

const HeroComponent: IStoryblok.FC<Hero> = ({ blok }) => {
  const { image, preamble, title, subtitle, buttonText, addConfetti, placement = 'top-left' } = blok;

  const placementClass = placementClasses[placement] || 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';

  return (
    <div
      key={blok._uid}
      {...storyblokEditable(blok)}
      data-test={'hero'}
      className={'relative mx-auto my-6 h-[60vh] w-full max-w-[180rem] overflow-hidden lg:my-8 lg:h-[70vh]'}
    >
      {(image as StoryblokImage)?.filename && (
        <Image
          src={(image as StoryblokImage).filename || ''}
          alt={title}
          fill
          priority={true}
          sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          className={'object-cover object-center px-6 lg:px-8'}
        />
      )}

      <div className={`absolute flex flex-col text-white ${placementClass}`}>
        <p
          className={'mb-8 text-[1.3rem] font-bold lg:mb-12 lg:text-[1.5rem]'}
          style={{ textShadow: 'rgba(0, 0, 0, 0.4) 0 0 2rem' }}
        >
          <span className={'bg-turquoise-dark rounded-[0.3rem] px-4 py-2 lg:px-6 lg:py-4'}>{preamble}</span>
        </p>
        <h1
          className={
            'font-heading m-0 mb-4 max-w-[70rem] pr-8 text-[4rem] uppercase leading-[4.5rem] tracking-tight lg:mb-8 lg:text-[8rem] lg:leading-[8rem]'
          }
          style={{ textShadow: 'rgba(0, 0, 0, 0.2) 0 0 1.5rem' }}
        >
          {title}
        </h1>
        <h2
          className={'mb-0 mt-0 text-[1.5rem] font-medium lg:text-[2rem]'}
          style={{ textShadow: 'rgba(0, 0, 0, 0.2) 0 0 1rem' }}
        >
          {subtitle}
        </h2>
      </div>

      {buttonText && (
        <Button
          buttonType={Button.Type.Outline}
          className={'absolute bottom-6 left-12 lg:bottom-20 lg:left-auto lg:right-28'}
        >
          {buttonText} <ArrowIcon />
        </Button>
      )}
      {addConfetti && <Confetti />}
    </div>
  );
};

export default HeroComponent;
