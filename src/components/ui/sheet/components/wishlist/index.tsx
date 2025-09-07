'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import WishlistProductCard from '@/src/components/product/WishlistProductCard';
import { useWishlist } from '@/src/hooks/useWishlist';
import PageHeader from '../../../../header/PageHeader';
import { Button } from '../../../../shadcn/button';

const Wishlist = () => {
  const { wishlistItems, clearWishlist, wishlistCount } = useWishlist();
  const t = useTranslations('wishlist');

  const handleClearAll = () => {
    clearWishlist();
  };

  return (
    <>
      <PageHeader hasHeaderFixed={false} />
      <div className={'mb-0 min-h-screen bg-alabaster font-light'}>
        <div className={'flex items-center justify-center px-4 py-10 pt-48 lg:px-8'}>
          <p className={'font-serif text-4xl font-semibold uppercase'}>{t('title')}</p>
        </div>

        <div>
          <div className={'ml-auto w-full pb-8 pr-8 text-right'}>
            {wishlistCount > 0 && (
              <Button
                variant={'custom'}
                onClick={handleClearAll}
                className={'ml-2 h-6 bg-secondary-600 px-2 py-0  text-xs uppercase text-white hover:bg-gray-800'}
                type={'button'}
              >
                {t('clear-all')}
              </Button>
            )}
          </div>

          <div className={'px-4 pb-10 lg:px-8'}>
            {wishlistCount === 0 ? (
              <div className={'flex flex-col items-center justify-center py-20 text-center'}>
                <h2 className={'mb-4 text-2xl font-medium text-gray-600'}>{t('no-items-found')}</h2>
                <p className={'text-gray-500'}>{t('empty-description')}</p>
              </div>
            ) : (
              <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}>
                {wishlistItems.map((item) => (
                  <WishlistProductCard key={item.id} product={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
