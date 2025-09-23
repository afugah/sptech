'use client';

import { StoryblokComponent } from '@storyblok/react';
import classNames from 'classnames';
import Image from 'next/image';
import React from 'react';
import {
  MARK_BOLD,
  MARK_LINK,
  MARK_UNDERLINE,
  NODE_BR,
  NODE_PARAGRAPH,
  render,
} from 'storyblok-rich-text-react-renderer';
import {
  marginBottomDesktopConst,
  marginBottomMobileConst,
  marginTopDesktopConst,
  marginTopMobileConst,
} from '@/src/lib/constants/storyblok';
import { type ContentCard as ContentCardType } from '@/src/types/framework/storyblok-components';

type Props = {
  blok: ContentCardType;
};

const ContentCard: React.FC<Props> = ({ blok }) => {
  const {
    title,
    subtitle,
    image,
    imagePosition = 'right',
    content,
    backgroundColor,
    mobileMarginTop,
    mobileMarginBottom,
    desktopMarginTop,
    desktopMarginBottom,
  } = blok;
  const isImageLeft = imagePosition === 'left';

  const renderContent = (content: unknown) => {
    return content
      ? render(content, {
          nodeResolvers: {
            [NODE_BR]: () => <br />,
            [NODE_PARAGRAPH]: (children) => <p className={'mb-3'}>{children}</p>,
          },
          markResolvers: {
            [MARK_BOLD]: (children) => <span className={'font-bold'}>{children}</span>,
            [MARK_UNDERLINE]: (children) => <span className={'underline'}>{children}</span>,
            [MARK_LINK]: (children, props) => {
              const { linktype, href, target } = props;
              if (linktype === 'email') {
                return <a href={`mailto:${href}`}>{children}</a>;
              }
              return (
                <a href={href} target={target} className={'underline'}>
                  {children}
                </a>
              );
            },
          },
        })
      : null;
  };

  const containerClasses = classNames(
    marginTopMobileConst[(mobileMarginTop as { value?: number })?.value ?? 0],
    marginBottomMobileConst[(mobileMarginBottom as { value?: number })?.value ?? 0],
    marginTopDesktopConst[(desktopMarginTop as { value?: number })?.value ?? 0],
    marginBottomDesktopConst[(desktopMarginBottom as { value?: number })?.value ?? 0],
  );

  const bgColor = (backgroundColor as { value?: string })?.value;
  const mobileBackgroundStyle = bgColor ? { backgroundColor: bgColor } : {};
  const desktopBackgroundStyle = bgColor ? { backgroundColor: bgColor } : {};

  return (
    <div key={blok._uid} className={containerClasses}>
      <div className={'relative bg-alabaster pt-44 md:hidden'} style={mobileBackgroundStyle}>
        <div className={'absolute -top-8 left-1/2 mx-auto w-4/5 -translate-x-1/2'}>
          <Image
            className={'h-[200px] w-[300px] object-cover'}
            height={200}
            width={300}
            src={image?.filename || ''}
            alt={image?.alt || title || ''}
          />
        </div>
        <div className={'px-8 py-4 text-center'}>
          {subtitle && <p className={'mb-2 text-sm uppercase text-gray-900'}>{subtitle}</p>}
          <h3 className={'mb-2 text-3xl font-light tracking-tight text-gray-900'}>{title}</h3>
          <div className={'mb-2 text-sm font-light leading-relaxed'}>{renderContent(content)}</div>
          <div className={'flex items-center justify-center gap-4'}>
            {blok.ctaButtons?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
          </div>
        </div>
      </div>

      <div
        className={`relative mb-4 hidden h-[550px] w-4/5 items-center bg-alabaster px-16 lg:flex ${
          isImageLeft ? 'ml-auto mr-16 justify-end' : 'justify-start md:mx-16'
        }`}
        style={desktopBackgroundStyle}
      >
        <Image
          className={`absolute h-[470px] w-[600px] object-cover ${isImageLeft ? '-left-36' : '-right-36'}`}
          height={600}
          width={600}
          src={image?.filename || ''}
          alt={image?.alt || title || ''}
        />
        <div className={'flex w-full max-w-lg flex-col'}>
          {subtitle && <p className={'mb-2 text-sm uppercase text-gray-900'}>{subtitle}</p>}
          <h3 className={'mb-4 text-5xl font-light'}>{title}</h3>
          <div className={'mb-2 font-light'}>{renderContent(content)}</div>
          <div className={'flex gap-x-4'}>
            {blok.ctaButtons?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
