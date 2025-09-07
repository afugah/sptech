import classNames from 'classnames';
import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { ProductTag } from '@/src/components/product/ProductTag';

type IProps = {
  slides: string[] | { src: string; alt: string }[];
  tags?: Array<{ label: string; color: string }>;
  product_flag?: Array<{ title: string; textColor: string; backgroundColor: string }>;
  productName?: string;
  className?: string;
};

type IDotButtonPropType = {
  selected: boolean;
  onClick: () => void;
};

const OPTIONS: EmblaOptionsType = { loop: true, watchDrag: true };

export const ImageGalleryHorizontal: React.FC<IProps> = (props) => {
  const { slides, product_flag, className, productName } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollTo = React.useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onInit = React.useCallback(
    (emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList());
      emblaApi.scrollTo(selectedIndex); // Scroll to the initial index on mount
    },
    [selectedIndex],
  );

  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <section className={classNames('w-full overflow-hidden overflow-x-auto', className)}>
      <div
        className={classNames(
          'relative flex max-h-full w-full flex-grow overflow-scroll overscroll-none scrollbar-hide',
        )}
        ref={emblaRef}
      >
        <div className={`embla__container flex self-center`}>
          {slides.map((slide, index) => (
            <div className={'embla__slide w-full flex-shrink-0'} key={index}>
              <Image
                className={'mx-auto h-auto w-full max-w-[1040px] object-contain'}
                priority={true}
                src={typeof slide === 'string' ? slide : slide.src}
                alt={
                  productName
                    ? productName.replace('NO', (index + 1).toString())
                    : typeof slide === 'string'
                      ? 'Product image'
                      : slide.alt
                }
                width={1500}
                height={2100}
              />

              <div className={'flex-start absolute bottom-4 left-4 flex flex-col items-start gap-2'}>
                {index === 0 &&
                  product_flag &&
                  product_flag.map(
                    (tag) =>
                      Array.isArray(tag) && tag.length > 0 && tag.map((t, index) => <ProductTag key={index} tag={t} />),
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={'mt-4 flex justify-center space-x-2 rounded-3xl bg-white p-2'}>
        {scrollSnaps.map((_, index) => (
          <DotButton key={index} selected={index === selectedIndex} onClick={() => scrollTo(index)} />
        ))}
      </div>
    </section>
  );
};

const DotButton: React.FC<IDotButtonPropType> = ({ selected, onClick }) => {
  return (
    <button
      type={'button'}
      className={`h-2 w-2 rounded-full ${selected ? 'bg-secondary-800' : 'bg-gray-300'}`}
      onClick={onClick}
    />
  );
};
