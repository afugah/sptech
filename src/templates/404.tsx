'use client';

import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/shadcn/button';
import { Link } from '@/src/i18n/navigation';
import PageHeader from '../components/header/PageHeader';

const NotFoundTemplate: React.FC = () => {
  const t = useTranslations('404');

  return (
    <div className={'relative flex min-h-screen w-full items-center justify-start overflow-hidden'}>
      <PageHeader hasHeaderFixed />

      <div className={'relative z-10 max-w-2xl px-4 md:px-16'}>
        <h1 className={'font-sans text-3xl font-bold text-black'}>404</h1>
        <p className={'mb-6 text-3xl uppercase text-black'}>
          {t('title')}
          {t('description')}
        </p>

        <Link href={'/'}>
          <Button size={'lg'} className={'uppercase focus:ring-2 focus:ring-creme focus:ring-offset-2'}>
            {t('button')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundTemplate;
