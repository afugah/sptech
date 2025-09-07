'use client';

import { type SbBlokData, StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useIdentification } from '@/src/context/identificationContext';
import { useWindowWidth } from '@/src/hooks/useWindowWidth';
import { Link } from '@/src/i18n/navigation';
import {
  alignItemsConst,
  bannerHeightConst,
  desktopBannerWidthConst,
  mobileBannerWidthConst,
  placementConst,
} from '@/src/lib/constants/storyblok';
import { SMALL } from '@/src/styles/theme';
import { type Banner } from '@/src/types/framework/storyblok-components';
import { displayForMember } from '@/src/util/displayForMemeber';

interface BannerProps {
  blok: Banner & SbBlokData;
  numberOfBlocks: number;
  format?: '' | '16-9' | '16-8' | '16-7' | '1-1' | '9-16';
}

const BannerComponent: React.FC<BannerProps> = ({ blok, numberOfBlocks, format }) => {
  // Optimized ReactPlayer import with loading state
  const ReactPlayer = dynamic(() => import('react-player/lazy'), {
    ssr: false,
    loading: () => (
      <div className={'bg-gray-100 flex h-64 items-center justify-center rounded'}>
        <div className={'text-center'}>
          <div className={'mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'}></div>
          <p className={'text-gray-600'}>Loading video...</p>
        </div>
      </div>
    ),
  });

  const {
    desktopBannerWidth,
    desktopBannerHeight,
    mobileBannerWidth,
    mobileBannerHeight,
    alignItems = 'left',
    placement = 'top-left',
    url,
    memberLevel,
    vimeo,
    vimeoMobile,
    mobileOverlay,
    mobileOverlayColor,
  } = blok;

  const { getTokenPayload } = useIdentification();
  const width = useWindowWidth();
  const isMobile = width < SMALL;
  const customerMemberLevel = getTokenPayload()?.memberLevel;
  const shouldDisplayBlock = memberLevel ? displayForMember(memberLevel, customerMemberLevel ?? '') : true;
  const overlayRef = useRef<HTMLDivElement>(null);

  // Function to calculate if a color is light or dark
  const isLightColor = (color: string): boolean => {
    // Convert hex to rgb
    let r, g, b;
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches) {
        [r, g, b] = matches.map(Number);
      }
    }

    if (r !== undefined && g !== undefined && b !== undefined) {
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    }

    return true; // Default to light if can't parse
  };

  // Apply smart text colors to buttons in overlay
  useEffect(() => {
    if (isMobile && mobileOverlay && overlayRef.current) {
      const buttons = overlayRef.current.querySelectorAll('button, a[class*="button"]');

      buttons.forEach((button) => {
        const element = button as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const backgroundColor = computedStyle.backgroundColor;

        if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          const textColor = isLightColor(backgroundColor) ? '#000000' : '#ffffff';
          element.style.setProperty('color', textColor, 'important');
        }
      });
    }
  }, [isMobile, mobileOverlay, blok?.blocks]);

  if (!shouldDisplayBlock) return null;

  const getAspectRatioClass = () => {
    switch (format) {
      case '16-9':
        return 'md:aspect-video';
      case '16-8':
        return 'md:aspect-[16/8]';
      case '16-7':
        return 'md:aspect-[16/7]';
      case '1-1':
        return 'md:aspect-square';
      case '9-16':
        return 'md:aspect-[9/16]';
      default:
        return numberOfBlocks >= 2 ? 'md:aspect-square' : 'md:aspect-auto';
    }
  };

  const bannerClasses = classNames(
    'w-screen',
    mobileBannerWidthConst[(mobileBannerWidth as { value?: number })?.value ?? 1],
    desktopBannerWidthConst[(desktopBannerWidth as { value?: number })?.value ?? 1],
    isMobile && mobileOverlay ? '' : getAspectRatioClass(),
    !isMobile && format ? '' : 'min-h-[50vh] md:min-h-0',
    !format && bannerHeightConst[mobileBannerHeight as string],
    !format && bannerHeightConst[desktopBannerHeight as string],
    numberOfBlocks >= 2 ? 'md:aspect-square' : 'md:aspect-auto',
    getAspectRatioClass(),
    !bannerHeightConst[desktopBannerHeight as string] && !format ? 'aspect-[4/5] lg:min-h-[500px]' : '',
  );

  const contentClasses = classNames(
    'absolute flex flex-col',
    isMobile && !mobileOverlay ? 'bottom-6 left-1/2 -translate-x-1/2 text-center' : placementConst[placement],
    isMobile && !mobileOverlay ? '' : alignItemsConst[alignItems],
  );

  return (
    <div className={bannerClasses} {...storyblokEditable(blok)} data-test={'banner'}>
      {isMobile && mobileOverlay ? (
        <div className={'flex flex-col'}>
          <div className={'relative min-h-[50vh] w-full'}>
            {(vimeoMobile as { vimeo_raw?: string })?.vimeo_raw ? (
              <ReactPlayer
                url={(vimeoMobile as { vimeo_raw: string }).vimeo_raw}
                playsinline={true}
                width={'100%'}
                height={'100%'}
                muted={true}
                loop={true}
                controls={false}
                playing
                className={'absolute left-0 top-0 z-0 object-cover'}
              />
            ) : blok.imageMobile && blok.imageMobile.filename ? (
              <Image
                src={blok.imageMobile.filename}
                alt={blok.imageMobile.alt || blok.imageMobile.filename}
                fill
                priority={true}
                title={blok.imageMobile.title || blok.imageMobile.filename}
                sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 75vw, 50vw'}
                className={'absolute left-0 top-0 z-0 object-cover'}
              />
            ) : blok.image && blok.image.filename ? (
              <Image
                src={blok.image.filename}
                alt={blok.image.alt || blok.image.filename}
                fill
                priority={true}
                title={blok.image.title || blok.image.filename}
                sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 75vw, 50vw'}
                className={'absolute left-0 top-0 z-0 object-cover'}
              />
            ) : null}
          </div>
          <div
            ref={overlayRef}
            className={'banner-overlay-content p-6 text-center'}
            style={{ backgroundColor: (mobileOverlayColor as { value?: string })?.value || '#f5f5f0' }}
          >
            {blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
          </div>
        </div>
      ) : (
        <div className={'relative block h-full w-full'}>
          {isMobile ? (
            (vimeoMobile as { vimeo_raw?: string })?.vimeo_raw ? (
              <ReactPlayer
                url={(vimeoMobile as { vimeo_raw: string }).vimeo_raw}
                playsinline={true}
                width={'100%'}
                height={'100%'}
                muted={true}
                loop={true}
                controls={false}
                playing
                className={'absolute left-0 top-0 z-0 object-cover md:hidden'}
              />
            ) : blok.imageMobile && blok.imageMobile.filename ? (
              <Image
                src={blok.imageMobile.filename}
                alt={blok.imageMobile.alt || blok.imageMobile.filename}
                fill
                priority={true}
                title={blok.imageMobile.title || blok.imageMobile.filename}
                sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 75vw, 50vw'}
                className={'absolute left-0 top-0 z-0 object-cover md:hidden'}
              />
            ) : blok.image && blok.image.filename ? (
              <Image
                src={blok.image.filename}
                alt={blok.image.alt || blok.image.filename}
                fill
                priority={true}
                title={blok.image.title || blok.image.filename}
                sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 75vw, 50vw'}
                className={'absolute left-0 top-0 z-0 object-cover'}
              />
            ) : null
          ) : (vimeo as { vimeo_raw?: string })?.vimeo_raw ? (
            <ReactPlayer
              url={(vimeo as { vimeo_raw: string }).vimeo_raw}
              playsinline={true}
              width={'100%'}
              height={'100%'}
              muted={true}
              loop={true}
              controls={false}
              playing
              className={'absolute left-0 top-0 z-0 object-cover'}
            />
          ) : blok.image && blok.image.filename ? (
            <Image
              src={blok.image.filename}
              alt={blok.image.alt || blok.image.filename}
              fill
              priority={true}
              title={blok.image.title || blok.image.filename}
              sizes={'(max-width: 2000px) 100vw, (max-width: 1200px) 75vw, 50vw'}
              className={'absolute left-0 top-0 z-0 object-cover'}
            />
          ) : null}

          <div className={contentClasses}>
            {blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
          </div>
          {url && url.url && <Link href={url.url} className={'absolute bottom-0 left-0 z-20 h-full w-full'}></Link>}
        </div>
      )}
    </div>
  );
};

export default BannerComponent;
