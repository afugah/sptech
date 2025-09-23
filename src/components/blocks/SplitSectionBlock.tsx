'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import { splitSectionImageSizeConst, splitSectionSpacingConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SplitSectionBlock } from '@/src/types/framework/storyblok-components';
import { safeString } from '@/src/types/framework/storyblok-helpers';

const SplitSectionBlockComponent: IStoryblok.FC<SplitSectionBlock> = ({ blok, ...props }) => {
  const { title, contents, image, imagePosition = 'right', imageSize = 'standard', spacing = 'standard' } = blok;

  const spacingClasses = splitSectionSpacingConst[spacing];
  const imageSizeConfig = splitSectionImageSizeConst[imageSize];

  const isImageLeft = imagePosition === 'left';
  const isTallImage = imageSize === 'tall';

  if (isTallImage) {
    const extractTextContent = (contentBlock: StoryblokRichtext): string => {
      if (!contentBlock?.content) return '';

      let totalText = '';

      const traverseContent = (item: unknown): void => {
        if (Array.isArray(item)) {
          item.forEach((subItem) => traverseContent(subItem));
        } else if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;

          if (typeof obj.text === 'string') {
            totalText += obj.text;
          }

          if (obj.content) {
            traverseContent(obj.content);
          }
        }
      };

      traverseContent(contentBlock.content);
      return totalText;
    };

    const extractTextFromStoryblokBlock = (block: unknown): string => {
      if (!block || typeof block !== 'object') return '';

      const obj = block as Record<string, unknown>;

      if (obj.component === 'text' && obj.content) {
        return extractTextContent(obj.content as StoryblokRichtext);
      }

      return '';
    };

    const totalTextLength =
      contents?.reduce((total, block) => {
        const textContent = extractTextFromStoryblokBlock(block);
        return total + textContent.length;
      }, 0) || 0;

    const dynamicPaddingTop = `pt-96 md:${
      totalTextLength > 1000
        ? 'pt-0'
        : totalTextLength > 800
          ? 'pt-8'
          : totalTextLength > 500
            ? 'pt-20'
            : totalTextLength > 200
              ? 'pt-28'
              : 'pt-32'
    }`;

    return (
      <div
        className={`relative mb-20 ${isImageLeft ? 'px-0' : 'px-6'} md:mb-0 md:px-28 md:pb-48 md:pt-20`}
        {...storyblokEditable(blok)}
        {...props}
      >
        {/* Mobile overlapping image */}
        {image?.filename && (
          <div className={'absolute -top-16 left-6 right-6 z-10 block lg:hidden'}>
            <Image
              className={'h-[430px] w-full object-cover'}
              width={400}
              height={430}
              src={safeString(image?.filename)}
              alt={safeString(image?.alt) || safeString(title) || ''}
            />
          </div>
        )}

        <div className={classNames(dynamicPaddingTop, 'lg:flex', isImageLeft ? 'lg:justify-end' : 'lg:justify-start')}>
          <div className={classNames('max-w-md lg:max-w-lg', isImageLeft ? '-mr-6 lg:-mr-28' : '-ml-6 lg:-ml-28')}>
            {title && <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{safeString(title)}</h3>}
            <div className={'mx-6 space-y-4 md:mx-0'}>
              {contents?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
            </div>
          </div>

          {/* Desktop overlapping image - extends beyond section bounds */}
          {image?.filename && (
            <div
              className={classNames(
                'absolute z-10 hidden lg:block',
                isImageLeft ? '-top-20 left-0' : '-top-20 right-0',
              )}
            >
              <Image
                className={'h-[750px] w-[600px] object-cover'}
                width={600}
                height={750}
                src={safeString(image?.filename)}
                alt={safeString(image?.alt) || safeString(title) || ''}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard layout for non-tall images
  const containerClasses = classNames('flex flex-col md:flex-row md:items-center md:gap-16', spacingClasses);

  const imageClasses = classNames(
    'w-full object-cover',
    imageSizeConfig.mobile,
    `md:${imageSizeConfig.desktop.replace('h-', 'h-')}`,
  );

  const desktopImageClasses = classNames('hidden flex-1 md:block', isImageLeft ? 'md:order-1' : 'md:order-2');

  const contentClasses = classNames('flex-1 px-2 md:px-0', isImageLeft ? 'md:order-2' : 'md:order-1');

  return (
    <div {...storyblokEditable(blok)} {...props}>
      {/* Mobile Image - Always shows above content */}
      {image?.filename && (
        <div className={'block px-2 py-6 md:hidden'}>
          <Image
            className={classNames('w-full object-cover', imageSizeConfig.mobile)}
            width={400}
            height={imageSize === 'standard' ? 300 : isTallImage ? 500 : 400}
            src={safeString(image?.filename)}
            alt={safeString(image?.alt) || safeString(title) || ''}
          />
        </div>
      )}

      {/* Main Content Container */}
      <div className={containerClasses}>
        {/* Content Area */}
        <div className={contentClasses}>
          <div className={'max-w-lg'}>
            {title && <h3 className={'mb-6 text-2xl font-light md:text-4xl'}>{safeString(title)}</h3>}
            {contents?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
          </div>
        </div>

        {/* Desktop Image */}
        {image?.filename && (
          <div className={desktopImageClasses}>
            <Image
              className={imageClasses}
              width={600}
              height={imageSize === 'standard' ? 500 : isTallImage ? 750 : 400}
              src={safeString(image?.filename)}
              alt={safeString(image?.alt) || safeString(title) || ''}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitSectionBlockComponent;
