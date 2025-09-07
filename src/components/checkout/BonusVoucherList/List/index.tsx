import { useTranslations } from 'next-intl';
import React from 'react';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';

const BonusVoucherList = () => {
  const t = useTranslations();
  const { cart } = useCart();

  return (
    <>
      {cart?.discountExternals?.map((voucher, index) => (
        <div key={voucher.reference} className={'contents text-red'}>
          <div className={'flex text-left'}>
            <span>{t('member.bonus-check', { index: index + 1 })}</span>
          </div>
          <span className={'text-right'}>-{getAmount(Math.round(voucher.discountAmount), voucher.currencyCode)}</span>
        </div>
      ))}
    </>
  );
};

export default BonusVoucherList;
