'use client';

import { useTranslations } from 'next-intl';
import React, { useCallback } from 'react';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { useRouter } from '@/src/i18n/navigation';

type StoreDetailBreadcrumbsProps = {
  storeName?: string;
};

export const StoreDetailBreadcrumbs: React.FC<StoreDetailBreadcrumbsProps> = React.memo(({ storeName }) => {
  const t = useTranslations();
  const router = useRouter();

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleStoreLocatorClick = useCallback(() => {
    router.push('/store-locator');
  }, [router]);

  return (
    <Breadcrumbs className={'flex items-center justify-center text-center text-xs font-bold uppercase'}>
      <li className={'text-gray-700'}>
        <button onClick={handleHomeClick} className={'uppercase hover:underline'}>
          {t('common.home')}
        </button>
      </li>
      <li>
        <button onClick={handleStoreLocatorClick} className={'uppercase text-gray-700 hover:underline'}>
          {t('menu.store-locator')}
        </button>
      </li>
      <li className={'uppercase text-black'}>{storeName || '...'}</li>
    </Breadcrumbs>
  );
});

StoreDetailBreadcrumbs.displayName = 'StoreDetailBreadcrumbs';
