'use client';

import { storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { paddingBottomConst, sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import {
  type CmsPageHeader,
  type StoryblokColorPicker,
  type StoryblokSlider,
} from '@/src/types/framework/storyblok-components';
import { type StoryblokContent } from '@/src/types/framework/storyblok-helpers';

const CmsPageHeaderComponent: IStoryblok.FC<CmsPageHeader> = ({ blok, ...props }) => {
  const {
    title,
    subtitle,
    description,
    titleSize = 'large',
    titleColor,
    layout = 'simple',
    backgroundColor,
    paddingBottom,
  } = blok;

  const t = useTranslations();
  const backgroundColorClass =
    backgroundColor && sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker)?.color];
  const customBackgroundStyle =
    (backgroundColor as StoryblokColorPicker)?.color && !backgroundColorClass
      ? { backgroundColor: (backgroundColor as StoryblokColorPicker).color }
      : undefined;
  const titleColorValue = (titleColor as StoryblokColorPicker)?.color || titleColor;
  const paddingBottomClass = paddingBottom && paddingBottomConst[(paddingBottom as StoryblokSlider)?.value];

  const titleSizeClasses = classNames(sizeConst[titleSize], 'text-center');

  const breadcrumbText = subtitle || title || '';
  const showBreadcrumbs = true;

  if (layout === 'overlay') {
    return (
      <div {...storyblokEditable(blok)} {...props}>
        <div
          className={classNames(
            'pt-40 sm:pt-44 lg:pt-48',
            backgroundColorClass as string,
            paddingBottomClass as string,
          )}
          style={customBackgroundStyle}
        >
          <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
            {subtitle && (
              <h1
                aria-hidden={'true'}
                className={
                  'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black sm:text-md lg:text-lg'
                }
              >
                {subtitle}
              </h1>
            )}
            {title && (
              <h2
                className={classNames(titleSizeClasses, 'uppercase', titleColorValue || 'text-creme')}
                style={typeof titleColorValue === 'string' ? { color: titleColorValue } : undefined}
              >
                {title}
              </h2>
            )}
          </div>
          {description && (
            <p className={'mx-auto mb-10 max-w-sm text-center text-lg font-light leading-7 md:max-w-3xl'}>
              {description}
            </p>
          )}
          {showBreadcrumbs && (
            <nav
              className={'mb-10 flex items-center justify-center text-center text-xs font-bold uppercase'}
              aria-label={'Breadcrumb'}
            >
              <ol className={'flex items-center space-x-2'}>
                <li>
                  <Link href={'/'} className={'uppercase hover:underline'}>
                    {t('common.home')}
                  </Link>
                </li>
                <li className={'text-xxs'}>{'>'}</li>
                <li className={'text-xxs'}>{breadcrumbText.toUpperCase()}</li>
              </ol>
            </nav>
          )}
        </div>
      </div>
    );
  }

  return (
    <div {...storyblokEditable(blok)} {...props}>
      <div
        className={classNames(
          'space-y-6 px-4 pt-40 sm:pt-44 md:space-y-10 lg:pt-48',
          backgroundColorClass as string,
          paddingBottomClass || 'pb-10 md:pb-0',
        )}
        style={customBackgroundStyle}
      >
        {title && (
          <h1
            className={classNames(titleSizeClasses, 'font-serif tracking-tight', titleColorValue || 'text-black')}
            style={
              titleColorValue
                ? {
                    color:
                      typeof titleColorValue === 'string'
                        ? titleColorValue
                        : ((titleColorValue as StoryblokContent)?.value as string),
                  }
                : undefined
            }
          >
            {title}
          </h1>
        )}
        {description && (
          <p className={'mx-auto max-w-2xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
            {description}
          </p>
        )}
        {showBreadcrumbs && (
          <nav
            className={'mb-6 flex items-center justify-center text-center text-xs font-bold uppercase md:mb-10'}
            aria-label={'Breadcrumb'}
          >
            <ol className={'flex items-center space-x-2'}>
              <li>
                <Link href={'/'} className={'uppercase hover:underline'}>
                  {t('common.home')}
                </Link>
              </li>
              <li className={'text-xxs'}>{'>'}</li>
              <li className={'text-xxs'}>{breadcrumbText.toUpperCase()}</li>
            </ol>
          </nav>
        )}
      </div>
    </div>
  );
};

export default CmsPageHeaderComponent;
