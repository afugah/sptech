'use client';

import StoreLogo from '@images/store-logo.svg';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
// import CurrencySelector from '../ui/CurrencySelector';

export const CheckoutHeader = () => {
  const t = useTranslations();
  return (
    <div className={'flex w-full flex-col items-center p-0'}>
      <div className={'flex w-full items-center justify-between px-6 py-6 md:px-20'}>
        <Link href={'/'} className={'cursor-pointer text-sm uppercase text-gray'}>
          {t('cart.back')}
        </Link>

        <Link href={'/'} aria-label={t('cart.back-to-shopping')} className={'flex items-center space-x-6'}>
          <StoreLogo className={'h-10 w-auto fill-black xs:h-16 lg:h-16'} />
        </Link>

        <div className={'flex items-center justify-end space-x-6 bg-gray-700'}>
          {/* <CurrencySelector showOnMobile={false} /> */}
          {/* <UserSelector /> */}
        </div>
      </div>
    </div>
  );
};
