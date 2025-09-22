'use client';

import classNames from 'classnames';
import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface IImageZoomGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

interface ImageZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

const OPTIONS: EmblaOptionsType = {
  loop: false,
  watchDrag: false, // Disable drag when zoomed
  containScroll: 'trimSnaps',
  skipSnaps: false,
};

export const ImageZoomGallery: React.FC<IImageZoomGalleryProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [imageStates, setImageStates] = useState<ImageZoomState[]>(
    images.map(() => ({ scale: 1, translateX: 0, translateY: 0 })),
  );

  // Touch handling state
  const touchStateRef = useRef({
    lastTouchDistance: 0,
    lastTouchCenter: { x: 0, y: 0 },
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    initialImageState: { scale: 1, translateX: 0, translateY: 0 },
  });

  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize carousel
  useEffect(() => {
    if (emblaApi && isOpen) {
      emblaApi.scrollTo(initialIndex, true);
      setSelectedIndex(initialIndex);
    }
  }, [emblaApi, isOpen, initialIndex]);

  // Handle carousel selection
  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  // Reset zoom when image changes
  useEffect(() => {
    setImageStates((prev) =>
      prev.map((state, index) => (index === selectedIndex ? { scale: 1, translateX: 0, translateY: 0 } : state)),
    );
  }, [selectedIndex]);

  // Touch event handlers
  const getTouchDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
  };

  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    if (touches.length >= 2) {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    }
    return { x: 0, y: 0 };
  };

  const updateImageState = useCallback((index: number, newState: Partial<ImageZoomState>) => {
    setImageStates((prev) => prev.map((state, i) => (i === index ? { ...state, ...newState } : state)));
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, imageIndex: number) => {
      e.preventDefault();

      const currentState = imageStates[imageIndex];
      touchStateRef.current.initialImageState = { ...currentState };

      if (e.touches.length === 1) {
        // Single touch - prepare for pan
        touchStateRef.current.isDragging = true;
        touchStateRef.current.startPosition = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 2) {
        // Two touches - pinch zoom
        touchStateRef.current.lastTouchDistance = getTouchDistance(e.touches);
        touchStateRef.current.lastTouchCenter = getTouchCenter(e.touches);
        touchStateRef.current.isDragging = false;
      }
    },
    [imageStates],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent, imageIndex: number) => {
      e.preventDefault();

      const currentState = imageStates[imageIndex];

      if (e.touches.length === 2) {
        // Pinch zoom
        const currentDistance = getTouchDistance(e.touches);
        const currentCenter = getTouchCenter(e.touches);

        if (touchStateRef.current.lastTouchDistance > 0) {
          const scaleDelta = currentDistance / touchStateRef.current.lastTouchDistance;
          const newScale = Math.min(Math.max(currentState.scale * scaleDelta, 1), 4);

          // Calculate translate to keep zoom centered on pinch point
          const container = imageContainerRefs.current[imageIndex];
          if (container) {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const offsetX = currentCenter.x - centerX;
            const offsetY = currentCenter.y - centerY;

            updateImageState(imageIndex, {
              scale: newScale,
              translateX: currentState.translateX + offsetX * (scaleDelta - 1) * 0.1,
              translateY: currentState.translateY + offsetY * (scaleDelta - 1) * 0.1,
            });
          }
        }

        touchStateRef.current.lastTouchDistance = currentDistance;
        touchStateRef.current.lastTouchCenter = currentCenter;
      } else if (e.touches.length === 1 && touchStateRef.current.isDragging && currentState.scale > 1) {
        // Pan when zoomed
        const deltaX = e.touches[0].clientX - touchStateRef.current.startPosition.x;
        const deltaY = e.touches[0].clientY - touchStateRef.current.startPosition.y;

        updateImageState(imageIndex, {
          translateX: touchStateRef.current.initialImageState.translateX + deltaX,
          translateY: touchStateRef.current.initialImageState.translateY + deltaY,
        });
      }
    },
    [imageStates, updateImageState],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, imageIndex: number) => {
      touchStateRef.current.isDragging = false;
      touchStateRef.current.lastTouchDistance = 0;

      // Double tap to zoom
      if (e.touches.length === 0 && e.changedTouches.length === 1) {
        const currentState = imageStates[imageIndex];
        if (currentState.scale === 1) {
          updateImageState(imageIndex, { scale: 2, translateX: 0, translateY: 0 });
        } else {
          updateImageState(imageIndex, { scale: 1, translateX: 0, translateY: 0 });
        }
      }
    },
    [imageStates, updateImageState],
  );

  // Mouse wheel zoom for desktop
  const handleWheel = useCallback(
    (e: React.WheelEvent, imageIndex: number) => {
      e.preventDefault();

      const currentState = imageStates[imageIndex];
      const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(currentState.scale * scaleDelta, 1), 4);

      updateImageState(imageIndex, {
        scale: newScale,
        translateX: newScale === 1 ? 0 : currentState.translateX,
        translateY: newScale === 1 ? 0 : currentState.translateY,
      });
    },
    [imageStates, updateImageState],
  );

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    if (emblaApi && emblaApi.canScrollPrev()) {
      emblaApi.scrollPrev();
    }
  }, [emblaApi]);

  const goToNext = useCallback(() => {
    if (emblaApi && emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goToPrevious, goToNext]);

  if (!isOpen) return null;

  return (
    <div ref={modalRef} className={'fixed inset-0 z-50 flex flex-col bg-white'} onClick={onClose}>
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={'absolute right-4 top-4 z-[70] text-black transition-colors hover:text-gray-600'}
        aria-label={'Close gallery'}
      >
        <svg className={'h-8 w-8'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
          <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M6 18L18 6M6 6l12 12'} />
        </svg>
      </button>

      {/* Counter */}
      <div
        className={
          'bg-gray-100 absolute left-1/2 top-4 z-[60] -translate-x-1/2 transform rounded px-3 py-1 text-sm text-black'
        }
      >
        {selectedIndex + 1} / {images.length}
      </div>

      {/* Zoom indicator */}
      {imageStates[selectedIndex]?.scale > 1 && (
        <div
          className={
            'bg-gray-100 absolute left-1/2 top-16 z-[60] -translate-x-1/2 transform rounded px-2 py-1 text-xs text-black'
          }
        >
          {Math.round(imageStates[selectedIndex].scale * 100)}%
        </div>
      )}

      {/* Main image area */}
      <div
        className={'relative flex flex-1 items-center justify-center overflow-hidden'}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={emblaRef} className={'h-full w-full overflow-hidden'}>
          <div className={'flex h-full'}>
            {images.map((image, index) => {
              const currentState = imageStates[index];
              return (
                <div
                  key={`zoom-${index}`}
                  className={'relative flex h-full w-full flex-none items-center justify-center'}
                >
                  <div
                    ref={(el) => {
                      imageContainerRefs.current[index] = el;
                    }}
                    className={'relative max-h-full max-w-full cursor-grab touch-none active:cursor-grabbing'}
                    style={{
                      transform: `scale(${currentState.scale}) translate(${currentState.translateX}px, ${currentState.translateY}px)`,
                      transition: touchStateRef.current.isDragging ? 'none' : 'transform 0.2s ease-out',
                    }}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={(e) => handleTouchMove(e, index)}
                    onTouchEnd={(e) => handleTouchEnd(e, index)}
                    onWheel={(e) => handleWheel(e, index)}
                  >
                    <Image
                      src={image}
                      alt={productName ? `${productName} - Image ${index + 1}` : `Product image ${index + 1}`}
                      width={0}
                      height={0}
                      className={
                        'h-auto max-h-[calc(100vh-140px)] w-auto max-w-full select-none object-contain md:max-h-[calc(100vh-200px)]'
                      }
                      sizes={'100vw'}
                      priority={Math.abs(index - selectedIndex) <= 1}
                      quality={80}
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={
                'absolute left-4 top-1/2 z-[60] -translate-y-1/2 transform p-2 text-black transition-colors hover:text-gray-600'
              }
              aria-label={'Previous image'}
              disabled={!emblaApi?.canScrollPrev()}
            >
              <svg className={'h-8 w-8'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M15 19l-7-7 7-7'} />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className={
                'absolute right-4 top-1/2 z-[60] -translate-y-1/2 transform p-2 text-black transition-colors hover:text-gray-600'
              }
              aria-label={'Next image'}
              disabled={!emblaApi?.canScrollNext()}
            >
              <svg className={'h-8 w-8'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M9 5l7 7-7 7'} />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail navigation below image */}
      {images.length > 1 && (
        <div className={'flex justify-center bg-white p-4'} onClick={(e) => e.stopPropagation()}>
          <div className={'bg-gray-100 flex max-w-[90vw] space-x-2 overflow-x-auto rounded p-2'}>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={classNames('h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all', {
                  'border-black': index === selectedIndex,
                  'border-transparent opacity-70': index !== selectedIndex,
                })}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className={'h-full w-full object-cover'}
                  quality={60}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
