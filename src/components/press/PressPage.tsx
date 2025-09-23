'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { type StoryblokStory } from '@/src/lib/storyblok/fetchStoryBlokStory';
import { type CmsPage } from '@/src/types/framework/storyblok-components';

interface PressPageProps {
  story?: StoryblokStory<CmsPage>;
}

const PressPage: React.FC<PressPageProps> = ({ story }) => {
  const t = useTranslations();

  return (
    <div className={''}>
      <PageHeader component={'config'} hasHeaderFixed={false} />
      <div className={'pt-40 sm:pt-44 lg:pt-48'}>
        <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
          <h1
            aria-hidden={'true'}
            className={
              'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black sm:text-sm lg:text-lg'
            }
          >
            {t('press.press')}
          </h1>
          <h2
            className={'text-center text-6xl font-light uppercase text-creme sm:text-8xl lg:text-9xl xl:text-[120px]'}
          >
            {t('press.contact')}
          </h2>
        </div>
      </div>
      <Breadcrumbs className={'mb-10 flex items-center justify-center text-center text-sm font-bold uppercase'}>
        <li>
          <a href={'/'} className={'uppercase hover:underline'}>
            {t('common.home')}
          </a>
        </li>
        <li className={'text-xxs'}>{t('press.press')}</li>
      </Breadcrumbs>

      <div className={'mx-auto max-w-4xl px-6 py-12'}>
        <div className={'mb-16'}>
          <h2 className={'mb-4 font-sans text-2xl font-bold'}>{t('press.press-contact')}</h2>
          <div className={'space-y-2 font-light'}>
            <p className={'text-sm'}>{story?.content?.contactPerson as string}</p>
            <p className={'text-sm'}>
              {t('press.email')}:{' '}
              <a href={`mailto:${story?.content?.contactEmail}`} className={''}>
                {(story?.content?.contactEmail as string) || ''}
              </a>
            </p>
          </div>
        </div>

        <div className={'mb-16'}>
          <h2 className={'mb-4 text-2xl font-bold'}>{t('press.press-material')}</h2>
          <div className={'space-y-2'}>
            <a href={story?.content?.loginUrl as string} className={'inline-flex items-center text-sm font-light'}>
              {t('press.login')} &gt;
            </a>
          </div>
        </div>

        {(story?.content?.description as string) && (
          <div className={'mb-16'}>
            <p className={'text-lg leading-relaxed'}>{story?.content?.description as string}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressPage;
