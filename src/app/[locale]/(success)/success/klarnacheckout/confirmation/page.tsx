'use client';

export const dynamic = 'force-dynamic';

import { sendGTMEvent } from '@next/third-parties/google';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import KlarnaCheckoutConfirmation from '@/src/components/checkout/KlarnaCheckout/Confirmation';
import Loader from '@/src/components/ui/Loader';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import { type KlarnaCheckoutResponse } from '@/src/lib/types/klarnacheckout';
import {
  type KlarnaResponse,
  transformToFindifyAnalyticsData,
  transformToGTMUserData,
  transformToTransactionData,
} from './helper';

const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;

export default function KlarnaCheckoutConfirmationPage() {
  const { token, clearCheckout, getCheckout, checkout } = useCheckout();
  const { clearCart, cart } = useCart();
  const [lastOrder, setLastOrder] = useLocalStorage<KlarnaCheckoutResponse | null>('lastOrder', null);
  const { emit } = useAnalytics();
  const { emitFeedback } = useFindifyAnalytics();
  const t = useTranslations();
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchKlarnaOrder = async () => {
      try {
        const response = await fetch(`${baseUrl}-kco/orders`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.error('Failed to fetch Klarna order:', response.statusText);
          return;
        }

        const res: KlarnaResponse = await response.json();
        setLastOrder(res);
        getCheckout(token);
      } catch (error) {
        console.error('Error fetching Klarna order:', error);
      }
    };

    fetchKlarnaOrder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (checkout) {
      setCheckoutLoaded(true);
    }
  }, [checkout]);

  useEffect(() => {
    if (!lastOrder || !checkoutLoaded || !cart || !checkout) return;

    const processAnalytics = async () => {
      try {
        const transaction = transformToTransactionData(cart, checkout, lastOrder);
        const findifyAnalytics = transformToFindifyAnalyticsData(checkout, lastOrder);
        const userData = await transformToGTMUserData(lastOrder);

        emit({ type: 'purchase', transaction });
        emitFeedback({
          type: 'purchase',
          properties: findifyAnalytics,
        });

        sendGTMEvent({
          event: 'set_user_data',
          user_data: userData,
        });

        clearCart();
        clearCheckout();
      } catch (error) {
        console.error('Error processing analytics:', error);
        // Still clear cart and checkout even if analytics fail
        clearCart();
        clearCheckout();
      }
    };

    processAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutLoaded]);

  if (lastOrder && lastOrder.klarna.status !== 'checkout_incomplete') {
    return (
      <KlarnaCheckoutConfirmation order={lastOrder.klarna} loading={lastOrder.klarna.status !== 'checkout_complete'} />
    );
  }

  return (
    <div className={'mt-24 flex h-full w-full flex-col items-center justify-center'}>
      <div className={'my-16 text-2xl'}>{t('checkout.order_message')}</div>
      <div className={'relative mb-16'}>
        <Loader />
      </div>
    </div>
  );
}
