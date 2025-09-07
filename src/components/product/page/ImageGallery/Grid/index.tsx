'use client';

import classNames from 'classnames';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { ImageGalleryHorizontal } from '@/src/components/product/page/ImageGallery/Horizontal';
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
  const { images = [], className } = props;
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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

  // During SSR and initial client render, show both versions with CSS to control visibility
  // This prevents hydration mismatches
  if (isMobile === null) {
    return (
      <>
        {/* Mobile version - hidden on desktop */}
        <div className={'relative max-h-[60vh] shrink-0 overflow-hidden md:hidden [&_img]:!relative'}>
          <ImageGalleryHorizontal slides={images} className={className} />
        </div>

        {/* Desktop version - hidden on mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap' }} className={classNames('hidden md:flex', className)}>
          {images.map((img, idx) => (
            <Image
              key={`${img}-${idx}`}
              src={img}
              width={0}
              height={0}
              className={classNames('h-auto pb-2 pr-2', {
                'w-full': images.length === 1,
                'w-full lg:w-1/2': images.length > 1,
              })}
              priority={true}
              quality={75}
              alt={'Product image'}
              sizes={`(max-width: ${MEDIUM}px) 100vw, 50vw`}
            />
          ))}
        </div>
      </>
    );
  }

  // After hydration, render based on actual window size
  if (isMobile) {
    return (
      <div className={'relative max-h-[60vh] shrink-0 overflow-hidden [&_img]:!relative'}>
        <ImageGalleryHorizontal slides={images} className={className} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }} className={className}>
      {/* TODO: Add some package to zoom on click */}
      {images.map((img, idx) => (
        <Image
          key={`${img}-${idx}`}
          src={img}
          width={0}
          height={0}
          className={classNames('h-auto pb-2 pr-2', {
            'w-full': images.length === 1,
            'w-full lg:w-1/2': images.length > 1,
          })}
          priority={true}
          quality={75}
          alt={'Product image'}
          sizes={`(max-width: ${MEDIUM}px) 100vw, 50vw`}
        />
      ))}
    </div>
  );
};
