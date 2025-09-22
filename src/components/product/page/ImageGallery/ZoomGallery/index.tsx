'use client';

import classNames from 'classnames';
import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useResponsiveImageSizes, useUserPreferences, useViewportHeight } from '@/src/hooks/useMediaQuery';

interface IImageZoomGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  aspectRatio?: string;
  rtl?: boolean;
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
  aspectRatio = '4/5',
  rtl = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
  const [imageStates, setImageStates] = useState<ImageZoomState[]>(
    images.map(() => ({ scale: 1, translateX: 0, translateY: 0 })),
  );

  // Accessibility state
  const [announcement, setAnnouncement] = useState('');
  const { prefersReducedMotion } = useUserPreferences();

  // Performance optimizations
  const imageSizes = useResponsiveImageSizes();
  const dynamicVh = useViewportHeight();

  // Generate unique IDs for ARIA
  const galleryId = useRef(`gallery-${Date.now()}`);
  const carouselId = useRef(`carousel-${Date.now()}`);
  const liveRegionId = useRef(`live-region-${Date.now()}`);

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

  // Announce image changes to screen readers
  useEffect(() => {
    if (isOpen) {
      const imageAnnouncement = `${productName ? `${productName} - ` : ''}Image ${selectedIndex + 1} of ${images.length}`;
      setAnnouncement(imageAnnouncement);
    }
  }, [selectedIndex, isOpen, productName, images.length]);

  // Clear announcement after 1 second to allow for new announcements
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

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

  // Enhanced keyboard navigation with accessibility announcements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (rtl) {
            goToNext();
          } else {
            goToPrevious();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (rtl) {
            goToPrevious();
          } else {
            goToNext();
          }
          break;
        case 'Home':
          e.preventDefault();
          if (emblaApi) {
            emblaApi.scrollTo(0);
            setAnnouncement(
              `Moved to first image: ${productName ? `${productName} - ` : ''}Image 1 of ${images.length}`,
            );
          }
          break;
        case 'End':
          e.preventDefault();
          if (emblaApi) {
            emblaApi.scrollTo(images.length - 1);
            setAnnouncement(
              `Moved to last image: ${productName ? `${productName} - ` : ''}Image ${images.length} of ${images.length}`,
            );
          }
          break;
        case ' ':
        case 'Enter': {
          // Space or Enter to zoom/unzoom
          e.preventDefault();
          const currentState = imageStates[selectedIndex];
          if (currentState.scale === 1) {
            updateImageState(selectedIndex, { scale: 2, translateX: 0, translateY: 0 });
            setAnnouncement('Zoomed in to 200%');
          } else {
            updateImageState(selectedIndex, { scale: 1, translateX: 0, translateY: 0 });
            setAnnouncement('Zoomed out to 100%');
          }
          break;
        }
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
  }, [
    isOpen,
    onClose,
    goToPrevious,
    goToNext,
    rtl,
    emblaApi,
    images.length,
    productName,
    selectedIndex,
    imageStates,
    updateImageState,
  ]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={'fixed inset-0 z-50 flex flex-col bg-white'}
      onClick={onClose}
      role={'dialog'}
      aria-modal={'true'}
      aria-labelledby={galleryId.current}
      aria-describedby={liveRegionId.current}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* Screen reader live region for announcements */}
      <div id={liveRegionId.current} aria-live={'polite'} aria-atomic={'true'} className={'sr-only'}>
        {announcement}
      </div>
      {/* Close button with larger touch target */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={
          'absolute right-2 top-2 z-[70] min-h-[44px] min-w-[44px] p-3 text-black transition-colors hover:text-gray-600'
        }
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
        <div
          ref={emblaRef}
          className={'h-full w-full overflow-hidden'}
          role={'region'}
          aria-label={`${productName || 'Product'} image gallery`}
          id={galleryId.current}
        >
          <div className={'flex h-full'} role={'group'} aria-live={'polite'}>
            {images.map((image, index) => {
              const currentState = imageStates[index];
              const isVisible = index === selectedIndex;
              return (
                <div
                  key={`zoom-${index}`}
                  className={'relative flex h-full w-full flex-none items-center justify-center'}
                  role={'group'}
                  aria-roledescription={'slide'}
                  aria-label={`Image ${index + 1} of ${images.length}${productName ? `: ${productName}` : ''}`}
                  aria-hidden={!isVisible}
                  tabIndex={isVisible ? 0 : -1}
                >
                  {/* Aspect ratio container to prevent CLS */}
                  <div
                    className={`relative w-full max-w-full`}
                    style={{
                      aspectRatio: aspectRatio,
                      maxHeight: `calc(${dynamicVh} - 140px)`,
                    }}
                  >
                    <div
                      ref={(el) => {
                        imageContainerRefs.current[index] = el;
                      }}
                      className={'relative h-full w-full cursor-grab touch-none active:cursor-grabbing'}
                      style={{
                        transform: `scale(${currentState.scale}) translate(${currentState.translateX}px, ${currentState.translateY}px)`,
                        transition:
                          prefersReducedMotion || touchStateRef.current.isDragging ? 'none' : 'transform 0.2s ease-out',
                      }}
                      onTouchStart={(e) => handleTouchStart(e, index)}
                      onTouchMove={(e) => handleTouchMove(e, index)}
                      onTouchEnd={(e) => handleTouchEnd(e, index)}
                      onWheel={(e) => handleWheel(e, index)}
                    >
                      <Image
                        src={image}
                        alt={productName ? `${productName} - Image ${index + 1}` : `Product image ${index + 1}`}
                        fill
                        className={'select-none object-contain'}
                        sizes={imageSizes.galleryMain}
                        priority={index === 0 || Math.abs(index - selectedIndex) <= 1}
                        quality={index === selectedIndex ? 80 : 75}
                        loading={index === 0 || Math.abs(index - selectedIndex) <= 1 ? 'eager' : 'lazy'}
                        draggable={false}
                        placeholder={'blur'}
                        blurDataURL={
                          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHh8P/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
                        }
                      />
                    </div>
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
                'absolute left-2 top-1/2 z-[60] min-h-[44px] min-w-[44px] -translate-y-1/2 transform p-3 text-black transition-colors hover:text-gray-600 disabled:opacity-50'
              }
              aria-label={rtl ? 'Next image' : 'Previous image'}
              aria-controls={carouselId.current}
              disabled={!emblaApi?.canScrollPrev()}
            >
              <svg className={'h-8 w-8'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M15 19l-7-7 7-7'} />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className={
                'absolute right-2 top-1/2 z-[60] min-h-[44px] min-w-[44px] -translate-y-1/2 transform p-3 text-black transition-colors hover:text-gray-600 disabled:opacity-50'
              }
              aria-label={rtl ? 'Previous image' : 'Next image'}
              aria-controls={carouselId.current}
              disabled={!emblaApi?.canScrollNext()}
            >
              <svg className={'h-8 w-8'} fill={'none'} stroke={'currentColor'} viewBox={'0 0 24 24'}>
                <path strokeLinecap={'round'} strokeLinejoin={'round'} strokeWidth={2} d={'M9 5l7 7-7 7'} />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail navigation below image with safe area support */}
      {images.length > 1 && (
        <nav
          className={'flex justify-center bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'}
          onClick={(e) => e.stopPropagation()}
          role={'tablist'}
          aria-label={'Image thumbnails'}
        >
          <div className={'bg-gray-100 flex max-w-[90vw] space-x-2 overflow-x-auto rounded p-2'}>
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={classNames(
                  'h-16 min-h-[44px] w-16 min-w-[44px] flex-shrink-0 touch-manipulation overflow-hidden rounded border-2 transition-all',
                  {
                    'border-black': index === selectedIndex,
                    'border-transparent opacity-70 hover:opacity-90': index !== selectedIndex,
                  },
                )}
                role={'tab'}
                aria-selected={index === selectedIndex}
                aria-controls={carouselId.current}
                aria-label={`Go to image ${index + 1}${productName ? ` of ${productName}` : ''}`}
                tabIndex={index === selectedIndex ? 0 : -1}
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
        </nav>
      )}
    </div>
  );
};
