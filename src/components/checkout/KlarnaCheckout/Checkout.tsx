import InnerHTML from 'dangerously-set-html-content';
import React, { useEffect } from 'react';
import { useCheckout } from '@/src/context/checkoutContext';
import { type KlarnaCheckoutOrder } from '@/src/lib/types/klarnacheckout';

interface KlarnaCheckoutProps {
  order: KlarnaCheckoutOrder;
  orderCreated?: boolean;
  confirmation?: boolean;
}

// Define Klarna API interface
interface KlarnaCheckoutAPI {
  suspend: () => void;
  resume: () => void;
  // Add other methods as needed
}

export function Checkout({ order, orderCreated, confirmation }: KlarnaCheckoutProps) {
  const { checkout, syncKlarnaOrder, checkoutLoaded } = useCheckout();

  useEffect(() => {
    if (checkoutLoaded && orderCreated) {
      suspend();
      syncKlarnaOrder();
      resume();
    }
    if (confirmation) {
      suspend();
      syncKlarnaOrder();
      resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout, orderCreated, checkoutLoaded]);

  return (
    <div className={'h-full w-full'}>
      <InnerHTML html={order.html_snippet} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

function suspend() {
  window._klarnaCheckout && window._klarnaCheckout((api: KlarnaCheckoutAPI) => api.suspend());
}

function resume() {
  window._klarnaCheckout && window._klarnaCheckout((api: KlarnaCheckoutAPI) => api.resume());
}
