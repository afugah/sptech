import ArrowLeft from '@images/icons/chevron-left.svg';
import ArrowRight from '@images/icons/chevron-right.svg';
import CloseIcon from '@images/icons/close.svg';
import classNames from 'classnames';
import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useWindowWidth } from '@/src/hooks/useWindowWidth';
import { SMALL } from '@/src/styles/theme';

type IDotButtonPropType = {
  selected: boolean;
  onClick: () => void;
};

type IPrevNextButtonPropType = {
  enabled: boolean;
  onClick: () => void;
};

type IFullScreenProps = {
  slides: string[] | { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
};

const OPTIONS: EmblaOptionsType = { loop: true, watchDrag: true };

export const FullScreenImageGallery = ({ slides, initialIndex, onClose }: IFullScreenProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [prevBtnEnabled, setPrevBtnEnabled] = React.useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = React.useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onInit = React.useCallback(
    (emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList());
      emblaApi.scrollTo(initialIndex); // Scroll to the initial index on mount
    },
    [initialIndex],
  );

  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);
  const width = useWindowWidth();
  const isMobile = useMemo(() => width && width < SMALL, [width]);
  return (
    <div className={'fixed inset-0 z-50 flex flex-col bg-white p-6'}>
      <div
        className={classNames('relative max-h-full w-full flex-grow overflow-scroll overscroll-none scrollbar-hide', {
          flex: isMobile,
        })}
        ref={emblaRef}
      >
        <div className={`embla__container flex ${isMobile && 'self-center'}`}>
          {slides.map((slide, index) => (
            <div className={'embla__slide w-full flex-shrink-0'} key={index}>
              <Image
                className={'mx-auto h-auto w-full max-w-[1040px] object-contain'}
                priority={true}
                src={typeof slide === 'string' ? slide : slide.src}
                alt={'Product image'}
                width={1500}
                height={2100}
              />
            </div>
          ))}
        </div>
      </div>
      <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
      <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />

      <div
        className={
          'absolute bottom-[50px] left-1/2 mt-4 flex -translate-x-1/2 justify-center space-x-2 rounded-3xl bg-white p-2'
        }
      >
        {scrollSnaps.map((_, index) => (
          <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
        ))}
      </div>
      <CloseButton onClick={onClose} />
    </div>
  );
};

const DotButton: React.FC<IDotButtonPropType> = ({ selected, onClick }) => {
  return (
    <button
      type={'button'}
      className={`h-3 w-3 rounded-full ${selected ? 'bg-secondary-800' : 'bg-gray-300'}`}
      onClick={onClick}
    />
  );
};

const PrevButton: React.FC<IPrevNextButtonPropType> = ({ enabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg ${
        enabled ? 'hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
      }`}
    >
      <ArrowLeft className={'h-6 w-6'} />
    </button>
  );
};

const NextButton: React.FC<IPrevNextButtonPropType> = ({ enabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg ${
        enabled ? 'hover:bg-gray-200' : 'cursor-not-allowed opacity-50'
      }`}
    >
      <ArrowRight className={'h-6 w-6'} />
    </button>
  );
};

const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={
        'absolute right-6 top-6 flex items-center justify-center rounded-full bg-white p-2 shadow-lg hover:bg-gray-200'
      }
    >
      <CloseIcon />
    </button>
  );
};
