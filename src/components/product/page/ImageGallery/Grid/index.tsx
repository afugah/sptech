'use client';

import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ImageGalleryHorizontal } from '@/src/components/product/page/ImageGallery/Horizontal';
import { ImageZoomGallery } from '@/src/components/product/page/ImageGallery/ZoomGallery';
import { MEDIUM } from '@/src/styles/theme';

interface IImageGalleryGridProps {
  images: string[] | undefined;
  withArrows?: boolean;
  tags?: Array<{ label: string; color: string }>;
  product_flag?: Array<{ title: string; textColor: string; backgroundColor: string }>;
  productName?: string;
  className?: string;
}

export const ImageGalleryGrid: React.FC<IImageGalleryGridProps> = (props) => {
  const { images = [], className, productName } = props;
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    // Only run on client side
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MEDIUM);
    };

    // Initial check
    checkIsMobile();

    // Add resize listener
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsZoomOpen(true);
  };

  // During SSR and initial client render, show both versions with CSS to control visibility
  // This prevents hydration mismatches
  if (isMobile === null) {
    return (
      <>
        {/* Mobile version - hidden on desktop */}
        <div className={'relative max-h-[60vh] shrink-0 overflow-hidden md:hidden [&_img]:!relative'}>
          <ImageGalleryHorizontal slides={images} className={className} onImageClick={handleImageClick} />
        </div>

        {/* Desktop version - hidden on mobile */}
        <div className={classNames('hidden gap-2 md:flex', className)}>
          {images.length > 1 ? (
            <>
              {/* First image - takes left half */}
              <div className={'w-1/2 cursor-pointer'} onClick={() => handleImageClick(0)}>
                <Image
                  key={`${images[0]}-0`}
                  src={images[0]}
                  width={0}
                  height={0}
                  className={'h-auto w-full transition-opacity hover:opacity-90'}
                  priority={true}
                  quality={75}
                  alt={'Product image'}
                  sizes={'50vw'}
                />
              </div>

              {/* Remaining images - arranged in grid on right half */}
              <div className={'grid w-1/2 grid-cols-2 gap-2'}>
                {images.slice(1).map((img, idx) => (
                  <div key={`${img}-${idx + 1}`} className={'cursor-pointer'} onClick={() => handleImageClick(idx + 1)}>
                    <Image
                      src={img}
                      width={0}
                      height={0}
                      className={'h-auto w-full transition-opacity hover:opacity-90'}
                      priority={idx < 3}
                      quality={75}
                      alt={'Product image'}
                      sizes={'25vw'}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Single image - full width */
            <div className={'cursor-pointer'} onClick={() => handleImageClick(0)}>
              <Image
                key={`${images[0]}-0`}
                src={images[0]}
                width={0}
                height={0}
                className={'h-auto w-full transition-opacity hover:opacity-90'}
                priority={true}
                quality={75}
                alt={'Product image'}
                sizes={'100vw'}
              />
            </div>
          )}
        </div>

        <ImageZoomGallery
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          productName={productName}
        />
      </>
    );
  }

  // After hydration, render based on actual window size
  if (isMobile) {
    return (
      <>
        <div className={'relative max-h-[60vh] shrink-0 overflow-hidden [&_img]:!relative'}>
          <ImageGalleryHorizontal slides={images} className={className} onImageClick={handleImageClick} />
        </div>
        <ImageZoomGallery
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          productName={productName}
        />
      </>
    );
  }

  return (
    <>
      <div className={classNames('flex flex-col gap-2', className)}>
        {images.length > 1 ? (
          <>
            {/* First image - takes left half */}
            <div className={'w-full cursor-pointer'} onClick={() => handleImageClick(0)}>
              <Image
                key={`${images[0]}-0`}
                src={images[0]}
                width={0}
                height={0}
                className={'h-auto w-full transition-opacity hover:opacity-90'}
                priority={true}
                quality={75}
                alt={'Product image'}
                sizes={'50vw'}
              />
            </div>

            {/* Remaining images - arranged in grid on right half */}
            <div className={'grid w-full grid-cols-2 gap-2'}>
              {images.slice(1).map((img, idx) => (
                <div key={`${img}-${idx + 1}`} className={'cursor-pointer'} onClick={() => handleImageClick(idx + 1)}>
                  <Image
                    src={img}
                    width={0}
                    height={0}
                    className={'h-auto w-full transition-opacity hover:opacity-90'}
                    priority={idx < 3}
                    quality={75}
                    alt={'Product image'}
                    sizes={'25vw'}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Single image - full width */
          <div className={'cursor-pointer'} onClick={() => handleImageClick(0)}>
            <Image
              key={`${images[0]}-0`}
              src={images[0]}
              width={0}
              height={0}
              className={'h-auto w-full transition-opacity hover:opacity-90'}
              priority={true}
              quality={75}
              alt={'Product image'}
              sizes={'100vw'}
            />
          </div>
        )}
      </div>

      <ImageZoomGallery
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        productName={productName}
      />
    </>
  );
};
