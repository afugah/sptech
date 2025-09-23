'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';
import { useRouter } from '@/src/i18n/navigation';
import { type ShopperGiftCardItem } from '@/src/lib/types/session';
import Loader from '../ui/Loader';

interface IGiftCardItemProps {
  className?: string;
  card: ShopperGiftCardItem;
}

const GiftCardItem: React.FC<IGiftCardItemProps> = ({ className, card }) => {
  const { cart, deleteRetain24GiftCardFromCart, giftCardProducts } = useCart();
  const { replace } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations();

  const handleDeleteCard = (id: string) => {
    setIsLoading(true);
    deleteRetain24GiftCardFromCart(id).finally(() => {
      setIsLoading(false);

      if (!cart?.items.length && giftCardProducts.length - 1 <= 0) {
        replace('/');
      }
    });
  };

  return (
    <div className={classNames('flex flex-row items-center gap-5 text-sm', className)}>
      {isLoading && <Loader overlay={'rgba(250, 249, 248, 0.8)'} inverted />}
      <Image src={'/giftCard.jpg'} alt={card.name} unoptimized width={100} height={150} />

      <div className={'flex w-full flex-row flex-wrap items-center'}>
        <div className={'order-1 flex flex-1 flex-col lg:basis-1/3'}>
          <div>{card.name}</div>
        </div>
        <div className={'order-3 mt-4 flex flex-1 basis-full lg:order-2 lg:mt-0 lg:w-auto lg:basis-1/3 lg:justify-end'}>
          <button
            onClick={() => handleDeleteCard(card.id)}
            className={
              'relative flex h-8 flex-row flex-nowrap items-center gap-px overflow-hidden rounded-full border border-gray-300 px-4 uppercase lg:h-10'
            }
          >
            {t('common.delete')}
          </button>
        </div>
        <div className={'order-2 flex flex-col gap-1 text-right lg:order-3 lg:basis-1/3'}>
          <span>{getAmount(Number(card.amount), cart?.currencyCode ?? '')}</span>
        </div>
      </div>
    </div>
  );
};

export default GiftCardItem;
