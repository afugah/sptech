'use client';

import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';

interface ProductImageProps {
  src: string;
  hoverSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, hoverSrc, alt, className, priority = false }) => {
  return (
    <div className={'relative w-full flex-1 overflow-hidden'}>
      <div className={'thumbnail contents'}>
        <Image
          src={src}
          alt={alt}
          width={500}
          height={500}
          className={classNames('h-full w-full', className)}
          priority={priority}
        />

        {!!hoverSrc && (
          <div
            className={
              'thumbnail-hover absolute left-0 right-0 top-0 flex h-full max-w-full items-center justify-center bg-white opacity-0 transition-opacity duration-300 ease-in-out'
            }
          >
            <Image src={hoverSrc} alt={alt} width={500} height={500} className={'h-full w-full'} />
          </div>
        )}
      </div>
    </div>
  );
};
