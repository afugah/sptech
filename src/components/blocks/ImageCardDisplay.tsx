'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ImageCardDisplay } from '@/src/types/framework/storyblok-components';
import { isSlider, safeString } from '@/src/types/framework/storyblok-helpers';
const ImageCardDisplayComponent: IStoryblok.FC<ImageCardDisplay> = ({ blok, ...props }) => {
  const { layoutMode, items = [], headerText = 'READ MORE ABOUT IT HERE:', backgroundColor, itemsPerView = 3 } = blok;
  const bgValue = isSlider(backgroundColor) ? safeString(backgroundColor.value, 'transparent') : 'transparent';
  const bgClass = `bg-[${bgValue}]`;

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Carousel logic
  const totalSlides = Math.ceil(items.length / Number(itemsPerView));
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;

  const goToPrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(totalSlides - 1, currentIndex + 1));
  };

  const getCurrentItems = () => {
    const startIndex = currentIndex * Number(itemsPerView);
    return items.slice(startIndex, startIndex + Number(itemsPerView));
  };

  const goToMobileSlide = (index: number) => {
    setMobileCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance && mobileCurrentIndex < items.length - 1) {
      setMobileCurrentIndex(mobileCurrentIndex + 1);
    }

    if (distance < -minSwipeDistance && mobileCurrentIndex > 0) {
      setMobileCurrentIndex(mobileCurrentIndex - 1);
    }
  };

  if (items.length === 0) {
    return null;
  }

  // Grid Layout
  if (layoutMode === 'grid') {
    return (
      <div className={`w-full ${bgClass} pb-28 md:pb-44`} {...storyblokEditable(blok)} {...props}>
        {headerText && (
          <div className={'mb-6 text-center'}>
            <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{headerText}</h3>
          </div>
        )}

        <div
          className={`mx-4 mt-20 grid gap-8 gap-y-32 ${
            Number(itemsPerView) === 1
              ? 'grid-cols-1'
              : Number(itemsPerView) === 2
                ? 'grid-cols-1 lg:grid-cols-2'
                : Number(itemsPerView) === 3
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {blok.items?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
        </div>
      </div>
    );
  }

  // Carousel Layout
  return (
    <div className={`w-full ${bgClass} pb-20 pt-10 md:pb-44`} {...storyblokEditable(blok)} {...props}>
      {headerText && (
        <div className={'mb-6 text-center'}>
          <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{headerText}</h3>
        </div>
      )}

      {/* Mobile Carousel View */}
      <div className={'block lg:hidden'}>
        <div className={'mx-4'}>
          <div className={'relative'}>
            <div
              className={'overflow-hidden'}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className={'flex pb-20 transition-transform duration-300 ease-in-out'}
                style={{ transform: `translateX(-${mobileCurrentIndex * 100}%)` }}
              >
                {items.map((item, index) => (
                  <div key={item._uid || index} className={'w-full flex-shrink-0'}>
                    <div className={'relative mx-4 flex flex-col'}>
                      <StoryblokComponent blok={item} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile dots indicator */}
        <div className={'mt-8 flex justify-center gap-2'}>
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMobileSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === mobileCurrentIndex ? 'bg-gray-800' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Carousel View */}
      <div className={'relative hidden w-full lg:block'}>
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={`absolute left-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center transition-all ${
            canGoPrev ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronLeft className={`h-16 w-16 ${canGoPrev ? 'text-gray-900' : 'text-gray-700'}`} />
        </button>

        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className={`absolute right-0 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center transition-all ${
            canGoNext ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronRight className={`h-16 w-16 ${canGoNext ? 'text-gray-900' : 'text-gray-700'}`} />
        </button>

        <div className={`flex w-full justify-center px-16 ${Number(itemsPerView) === 2 ? 'gap-8' : 'gap-16'}`}>
          {getCurrentItems().map((item, index) => (
            <div key={item._uid || index} className={Number(itemsPerView) === 2 ? 'flex-1 flex-shrink-0' : ''}>
              <StoryblokComponent blok={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCardDisplayComponent;
