'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import OrderRow from '@/src/components/profile/orderHistory/OrderRow';
import Loader from '@/src/components/ui/Loader';
import { useVoyado } from '@/src/context/voyadoContext';
import { type VoyadoTransactions } from '@/src/lib/types/voyado';
import { getOrderHistory } from '@/src/templates/orderHistory/actions';

const OrderHistoryPage: React.FC = () => {
  const { customer } = useVoyado();
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<VoyadoTransactions | null>(null);
  useEffect(() => {
    if (!customer) return;
    setIsLoading(true);

    getOrderHistory(customer.contactId)
      .then(setTransactions)
      .finally(() => setIsLoading(false));
  }, [customer]);

  const orders = useMemo(() => transactions?.items ?? [], [transactions?.items]);

  return (
    <div className={'container py-10'}>
      <h2 className={'mb-6 text-center text-4xl'}>{t('member.order-history')}</h2>

      {isLoading ? (
        <div className={'relative min-h-48'}>
          <Loader inverted />
        </div>
      ) : orders.length ? (
        <div className={'mx-auto max-w-screen-lg text-xs md:text-sm'}>
          <div className={'flex justify-between px-6 pb-6 pt-10 text-gray'}>
            <div className={'basis-1/5 uppercase'}>{t('member.date')}</div>
            <div className={'basis-1/5 uppercase'}>{t('member.order-no')}</div>
            <div className={'basis-1/5 uppercase'}>{t('member.price')}</div>
            <div className={'basis-1/5 uppercase'}>{t('cart.items')}</div>
            <div className={'basis-1/5 uppercase'}>{t('member.store')}</div>
            <div></div>
          </div>
          <div className={'box-border grid grid-cols-1 gap-y-5'}>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        </div>
      ) : (
        <p className={'min-h-48 text-center'}>{t('member.no-orders-found')}</p>
      )}
    </div>
  );
};

export default OrderHistoryPage;
