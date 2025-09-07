'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/shadcn/button';
import { Link } from '@/src/i18n/navigation';

interface CarouselItem {
  title: string;
  image?: {
    filename: string;
    alt?: string;
  };
  slug?: string;
  _uid?: string;
}

interface FaqCarouselProps {
  items: CarouselItem[];
  className?: string;
  itemsPerView?: number;
  headerText?: string;
  backgroundColor?: string;
  urlPath?: string;
  buttonText?: string;
}

const FaqCarousel: React.FC<FaqCarouselProps> = ({
  items,
  className = '',
  itemsPerView = 3,
  headerText = 'READ MORE ABOUT IT HERE:',
  backgroundColor = 'bg-creme',
  urlPath = '/faq/materials',
  buttonText = 'FULL STORY',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalSlides = Math.ceil(items.length / itemsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;

  const goToPrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(totalSlides - 1, currentIndex + 1));
  };

  const getCurrentItems = () => {
    const startIndex = currentIndex * itemsPerView;
    return items.slice(startIndex, startIndex + itemsPerView);
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

  return (
    <div className={`w-full ${backgroundColor} pt-10 ${className} pb-20 md:pb-44`}>
      <div className={'mb-6 text-center'}>
        <h3 className={'font-sans text-lg font-bold uppercase tracking-[0.2em] text-gray-900'}>{headerText}</h3>
      </div>

      {/* Mobile View */}
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
                      <div className={'relative h-[350px] w-full overflow-hidden'}>
                        {item.image?.filename && (
                          <Image
                            className={'h-full w-full object-cover'}
                            width={400}
                            height={350}
                            src={item.image.filename}
                            alt={item.image.alt || item.title}
                          />
                        )}
                      </div>
                      <div
                        className={
                          'absolute -bottom-20 left-1/2 z-10 w-11/12 -translate-x-1/2 bg-backgroundAlternative p-4'
                        }
                      >
                        <h4 className={'mb-4 text-center text-xl font-normal uppercase tracking-wider'}>
                          {item.title}
                        </h4>
                        <Button
                          asChild
                          className={'w-full bg-gray-800 py-3 text-xs font-normal uppercase tracking-wider'}
                          size={'lg'}
                        >
                          <Link href={`${urlPath}/${item.slug}`}>{buttonText}</Link>
                        </Button>
                      </div>
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

      {/* Desktop View */}
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

        <div className={`flex w-full justify-center px-16 ${items.length === 2 ? 'gap-20' : 'gap-16'}`}>
          {getCurrentItems().map((item, index) => (
            <div key={item._uid || index} className={'relative flex flex-col'}>
              <div
                className={`relative overflow-hidden ${
                  items.length === 2 ? 'h-[500px] w-[600px]' : 'h-[350px] w-[400px]'
                }`}
              >
                {item.image?.filename && (
                  <Image
                    className={'h-full w-full object-cover'}
                    height={items.length === 2 ? 500 : 400}
                    width={items.length === 2 ? 600 : 400}
                    src={item.image.filename}
                    alt={item.image.alt || item.title}
                  />
                )}
              </div>
              <div className={'absolute -bottom-20 left-1/2 w-11/12 -translate-x-1/2 bg-backgroundAlternative p-4'}>
                <h4 className={'mb-4 text-center text-2xl font-bold uppercase tracking-wider'}>{item.title}</h4>
                <Button
                  asChild
                  className={'w-full bg-gray-800 py-3 text-xs font-normal uppercase tracking-wider'}
                  size={'lg'}
                >
                  <Link href={`${urlPath}/${item.slug}`}>{buttonText}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqCarousel;
