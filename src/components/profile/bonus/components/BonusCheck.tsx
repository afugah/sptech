import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useCart } from '@/src/context/cartContext';

interface BonusCheckProps {
  bonusAmount: string;
}

const BonusCheck: React.FC<BonusCheckProps> = ({ bonusAmount }) => {
  const t = useTranslations();
  const { store } = useCart();
  const currencyCode = store?.currencyCode === 'SEK' ? 'Kr' : store?.currencyCode === 'NOK' ? 'Kr' : 'EUR';
  return (
    <div className={'flex gap-4 p-6 max-md:flex-col'}>
      <div className={'max-w-[300px]'}>
        <h3 className={'mb-2 font-sans text-xs uppercase text-gray-600'}>{t('member.bonus-check')}</h3>
        <p className={'text-2xl font-normal'}>{t('member.bonus-message')}</p>
      </div>

      <div className={'relative flex flex-col gap-2'}>
        <Image width={360} height={220} src={'/giftCard.png'} alt={'Bonus Card'} />
        <span
          className={'absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 font-serif text-2xl text-black'}
        >
          {bonusAmount} {currencyCode}
        </span>
        <span className={'text-sm text-secondary'}>{t('member.activate-in-cart')}</span>
      </div>
    </div>
  );
};

export default BonusCheck;
