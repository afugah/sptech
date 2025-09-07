'use client';

import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { type VoyadoTransactionItem } from '@/src/lib/types/voyado';

interface IOrderRowProps {
  order: VoyadoTransactionItem;
}

const OrderRow: React.FC<IOrderRowProps> = ({ order }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();

  return (
    <div className={''}>
      <div className={'flex cursor-pointer justify-between bg-seashell px-6 py-4'} onClick={() => setIsOpen(!isOpen)}>
        <div className={'basis-1/5'}>{new Date(order.createdDate).toLocaleDateString('SE')}</div>
        <div className={'basis-1/5'}>{order.transactionNumber}</div>
        <div className={'basis-1/5'}>
          {order.netPriceSum % 1 === 0 ? order.netPriceSum : order.netPriceSum.toFixed(2)} {order.localCurrency}
        </div>
        <div className={'basis-1/5 lowercase'}>
          {order.numberOfItems} {order.numberOfItems === 1 ? t('cart.item') : t('cart.items')}
        </div>
        <div className={'basis-1/5'}>{order.storeName}</div>
        <span>{isOpen ? '↑' : '↓'}</span>
      </div>

      <div
        className={`${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden transition-all duration-500 ease-in-out`}
      >
        {isOpen && (
          <div className={'flex flex-col justify-between gap-y-4 bg-gray-200 px-8 py-6 pt-10'}>
            <div className={'flex flex-row justify-between border-b border-gray-300 pb-5 text-gray-800'}>
              <div className={'basis-1/3'}>Artikelnamn</div>
              <div className={'basis-1/5'}>Artikelgrupp</div>
              <div className={'basis-1/5'}>Artikelnummer</div>
              <div className={'basis-1/7'}>Antal</div>
              <div className={'basis-1/5 text-right'}>Pris</div>
            </div>
            <div className={'flex flex-col'}>
              {order?.lineItems.map((item, index) => (
                <div
                  key={index}
                  className={`mb-5 flex flex-row justify-between border-b border-gray-300 pb-5 ${item.isReturned ? 'line-through' : ''}`}
                >
                  <div className={'basis-1/3'}>{item.articleName}</div>
                  <div className={'basis-1/5'}>{item.articleGroup}</div>
                  <div className={'basis-1/5'}>{item.articleNumber}</div>
                  <div className={'basis-1/7'}>{item.quantity}</div>
                  <div className={'basis-1/5 text-right'}>
                    {item.price % 1 === 0 ? item.price : item.price.toFixed(2)} {order.localCurrency}
                  </div>
                </div>
              ))}
              <div className={'flex flex-col gap-y-4'}>
                <div className={'flex justify-end gap-8'}>
                  <div className={'uppercase text-gray-600'}>
                    ( {order.numberOfItems} {order.numberOfItems === 1 ? t('cart.item') : t('cart.items')} )
                  </div>
                  <div className={'uppercase'}>{t('cart.total-price')}</div>
                  <div className={'uppercase'}>
                    {order.netPriceSum % 1 === 0 ? order.netPriceSum : order.netPriceSum.toFixed(2)}{' '}
                    {order.localCurrency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderRow;
