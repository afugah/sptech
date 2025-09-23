import Image from 'next/image';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ImageWithText } from '@/src/types/framework/storyblok-components';

const ImageWithTextComponent: IStoryblok.FC<ImageWithText> = ({ blok }) => {
  const { title, subTitle, linkText, image, isBanner } = blok;

  return (
    <>
      {isBanner && image?.filename && (
        <div className={'h-hero-image-category  relative w-full overflow-hidden bg-cover'}>
          <Image
            src={image?.filename || '/images/efva-category-1920x1080.jpg'}
            alt={image.alt || `Gift-cards hero image `}
            width={1920}
            height={1080}
            className={'h-[18rem] w-full object-cover lg:h-[38rem] 2xl:h-[32rem]'}
          />
        </div>
      )}

      {!isBanner && title && subTitle && image?.filename && (
        <div className={'relative mt-0 h-[40rem] w-full'}>
          {/* Image fills the entire div */}
          <Image
            height={1080}
            width={1920}
            src={image?.filename || ''}
            alt={image?.alt || ''}
            className={'absolute inset-0 h-full w-full object-cover'}
          />

          {/* Text on top of image */}
          <div
            className={
              ' absolute inset-0 flex flex-col items-center justify-end gap-y-2 pb-8 lg:items-start lg:justify-center lg:gap-y-5 lg:pb-0 lg:pl-3  '
            }
          >
            <div
              className={
                'flex flex-col items-center justify-center px-5 text-center font-serif md:px-0 lg:w-96 lg:items-start lg:justify-center lg:gap-y-1  lg:text-left'
              }
            >
              <p className={' text-xl font-medium italic text-white sm:text-3xl lg:text-4xl'}>{title}</p>
              <p className={'break-words text-3xl font-bold uppercase text-white sm:text-6xl'}>{subTitle}</p>
            </div>
            <Link className={'bg-[#D9C2B6] p-4 px-14 text-sm font-semibold uppercase text-black'} href={'#'}>
              {linkText || 'Learn more'}
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageWithTextComponent;
