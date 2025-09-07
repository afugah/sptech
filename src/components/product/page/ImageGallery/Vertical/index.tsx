'use client';

import ArrowLeft from '@images/icons/chevron-left.svg';
import ArrowRight from '@images/icons/chevron-right.svg';
import classNames from 'classnames';
import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useToggle } from 'usehooks-ts';
import { ProductTag } from '@/src/components/product/ProductTag';
import { FullScreenImageGallery } from '../FullScreenImageGallery';

type IProps = {
  slides: string[] | { src: string; alt: string }[];
  withArrows?: boolean;
  tags?: Array<{ label: string; color: string }>;
  product_flag?: Array<{ title: string; textColor: string; backgroundColor: string }>;
  productName?: string;
  className?: string;
};

const OPTIONS: EmblaOptionsType = { loop: true, watchDrag: false };

export const ImageGalleryVertical = ({ slides, withArrows = true, className, product_flag, productName }: IProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [isFullScreen, toggleFullScreen] = useToggle(false);
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isFullScreen);
  }, [isFullScreen]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);
  const closeFullScreen = () => {
    toggleFullScreen();
  };
  return (
    <div className={className}>
      {isFullScreen && (
        <FullScreenImageGallery slides={slides} initialIndex={selectedIndex} onClose={closeFullScreen} />
      )}
      <div className={'flex h-[958px] flex-row gap-x-5'}>
        <div className={'relative h-full basis-1/6 overflow-hidden'}>
          <div className={'hide-scrollbar hidden h-full flex-col gap-y-2.5 overflow-hidden overflow-y-auto md:flex'}>
            {slides.map((slide, index) => (
              <div
                className={classNames(
                  'cursor-pointer opacity-40 transition-opacity duration-300 last-of-type:mb-20 hover:opacity-100',
                  { '!opacity-100': index === selectedIndex },
                )}
                key={index}
                onClick={() => scrollTo(index)}
              >
                <Image
                  width={160}
                  height={225}
                  priority={true}
                  src={typeof slide === 'string' ? slide : slide.src}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  alt={
                    productName
                      ? productName.replace('NO', (index + 1).toString())
                      : typeof slide === 'string'
                        ? 'Product image'
                        : slide.alt
                  }
                />
              </div>
            ))}
          </div>
          <div className={'pointer-events-none absolute bottom-0 h-20 w-full bg-gradient-fade-from-bottom'} />
        </div>

        <div className={'relative flex-1 lg:max-h-none'}>
          <div className={classNames('embla h-full')} ref={emblaRef}>
            <div className={classNames('embla__container h-full')}>
              {slides.map((slide, index) => (
                <div
                  className={'embla__slide relative h-full min-w-0 flex-[0_0_100%] cursor-pointer'}
                  role={'button'}
                  key={index}
                  onClick={toggleFullScreen}
                >
                  <Image
                    alt={
                      productName
                        ? productName.replace('NO', (index + 1).toString())
                        : typeof slide === 'string'
                          ? 'Product image'
                          : slide.alt
                    }
                    priority={true}
                    width={800}
                    height={1200}
                    className={'h-full max-h-[60rem] object-cover object-top lg:max-h-none lg:object-cover'}
                    src={typeof slide === 'string' ? slide : slide.src}
                    style={{ color: 'transparent' }}
                    sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px'}
                  />
                  <div className={'flex-start absolute bottom-4 left-4 flex flex-col items-start gap-2'}>
                    {index === 0 &&
                      product_flag &&
                      product_flag.map((tag, index) => <ProductTag key={index} tag={tag} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {withArrows && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={
                  'absolute left-6 top-1/2 hidden -translate-y-1/2 cursor-pointer border-none bg-none disabled:cursor-not-allowed lg:block'
                }
              >
                <ArrowLeft className={'h-12'} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={
                  'absolute right-6 top-1/2 hidden -translate-y-1/2 cursor-pointer border-none bg-none disabled:cursor-not-allowed lg:block'
                }
              >
                <ArrowRight className={'h-12'} />
              </button>
            </>
          )}

          <div className={'absolute bottom-8 left-0 right-0 flex justify-center gap-2 lg:hidden'}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={classNames(
                  'h-2.5 w-2.5 rounded-full border-none bg-gray-300 p-0 transition-all duration-300',
                  { 'bg-turquoise-dark': index === selectedIndex },
                )}
                type={'button'}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
