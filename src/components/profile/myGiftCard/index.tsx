'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useLocale } from 'use-intl';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';
import { useRouter } from '@/src/i18n/navigation';
import { type ShopperGiftCardItem } from '@/src/lib/types/session';
import Loader from '../../ui/Loader';

interface IMyGiftCardProps {
  className?: string;
  card: ShopperGiftCardItem;
}

const MyGiftCard: React.FC<IMyGiftCardProps> = ({ className, card }) => {
  const { cart, deleteRetain24GiftCardFromCart, giftCardProducts } = useCart();
  const { replace } = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useTranslations();
  const locale = useLocale();

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

      <div className={'flex w-full flex-col flex-wrap justify-between gap-y-5'}>
        <div className={'flex justify-between'}>
          <div>{card.name}</div>
          <div className={'text-right'}>
            <span>{getAmount(Number(card.amount), cart?.currencyCode ?? '', locale)}</span>
          </div>
        </div>

        <div className={'order-3 mt-4 flex flex-1 basis-full lg:order-2 lg:mt-0 lg:w-auto lg:basis-1/3'}>
          <button
            onClick={() => handleDeleteCard(card.id)}
            className={
              'relative flex h-8 flex-row flex-nowrap items-center gap-px overflow-hidden rounded-full border border-gray-300 px-4 uppercase lg:h-10'
            }
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyGiftCard;
