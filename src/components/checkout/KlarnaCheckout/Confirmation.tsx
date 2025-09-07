import React from 'react';
import Loader from '@/src/components/ui/Loader';
import { type KlarnaCheckoutOrder } from '@/src/lib/types/klarnacheckout';
import { Checkout } from './Checkout';
import styles from './Confirmation.module.css';

type Props = {
  order?: KlarnaCheckoutOrder;
  loading: boolean;
};

const KlarnaCheckoutConfirmation = ({ order, loading }: Props) => (
  <div className={styles.wrapper}>
    <div className={styles.container}>
      {loading && <Loader inverted />}
      {order && <Checkout confirmation={true} order={order} />}
    </div>
  </div>
);

export default KlarnaCheckoutConfirmation;
