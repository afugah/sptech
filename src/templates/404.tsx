'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Button } from '@/components/shadcn/button';
import { Link } from '@/src/i18n/navigation';
import PageHeader from '../components/header/PageHeader';

const NotFoundTemplate: React.FC = () => {
  const t = useTranslations('404');

  return (
    <div className={'relative flex min-h-screen w-full items-center justify-start overflow-hidden'}>
      <Image
        src={'/images/404.jpg'}
        alt={
          'Elegant woman with surprised expression wearing black off-shoulder dress and statement leaf necklace against dark background'
        }
        fill
        priority
        className={'object-cover'}
      />
      <PageHeader hasHeaderFixed />

      <div className={'relative z-10 max-w-2xl px-4 md:px-16'}>
        <h1 className={'font-serif text-3xl font-bold text-white'}>{t('title')}</h1>
        <p className={'mb-6 font-serif text-7xl uppercase text-white'}>{t('description')}</p>

        <Link href={'/'}>
          <Button
            size={'lg'}
            className={'bg-creme uppercase text-black focus:ring-2 focus:ring-creme focus:ring-offset-2'}
          >
            {t('button')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundTemplate;
