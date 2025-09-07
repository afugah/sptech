import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Checkout } from '@/src/components/checkout/KlarnaCheckout/Checkout';
import Loader from '@/src/components/ui/Loader';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import styles from './index.module.css';

function getUrl(path: string): string {
  if (window !== undefined) {
    return new URL(path, window.location.origin).href;
  }

  return path;
}

export default function KlarnaCheckoutPage() {
  const { createKlarnaOrder, klarnaOrder, checkout } = useCheckout();
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const { cart } = useCart();
  const { emit } = useAnalytics();
  const locale = useLocale();

  useEffect(() => {
    if (!klarnaOrder || !klarnaOrder?.klarna?.order_id) {
      setOrderCreated(false);

      createKlarnaOrder(getUrl('/checkout'), getUrl(`/${locale}/success/klarnacheckout/confirmation`)).then(() => {
        if (cart?.items) {
          emit({ type: 'checkout', item: cart?.items });
        }
        setOrderCreated(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout]);

  return !klarnaOrder?.klarna ? (
    <Loader inverted />
  ) : (
    <div className={styles.klarnaContainer}>
      <Checkout orderCreated={orderCreated} order={klarnaOrder.klarna} />
    </div>
  );
}
