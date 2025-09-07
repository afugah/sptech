import React from 'react';
import { getAmount } from '@/src/helpers/money';
import { type ShopperCheckoutTotals } from '@/src/lib/types/session';
import Loader from '../ui/Loader';
import styles from './Totals.module.css';

type Props = {
  totals: ShopperCheckoutTotals | undefined;
  currencyCode: string;
};

const Totals = ({ totals, currencyCode }: Props) => (
  <div className={styles.container}>
    {totals ? (
      <>
        <div className={styles.row}>
          <h4>Subtotal</h4> <p>{getAmount(Math.round(totals.subTotal), currencyCode)}</p>
        </div>
        <div className={styles.row}>
          <h4>Shipping</h4> <p>{getAmount(Math.round(totals.shippingTotal), currencyCode)}</p>
        </div>
        {totals.giftCardTotal > 0 && (
          <div className={styles.row}>
            <h4>Gift card</h4>
            <p className={styles.discount}>-{getAmount(Math.round(totals.giftCardTotal), currencyCode)}</p>
          </div>
        )}
        {totals.discountTotal > 0 && (
          <div className={styles.row}>
            <h4>Total discount</h4>
            <p className={styles.discount}>-{getAmount(Math.round(totals.discountTotal), currencyCode)}</p>
          </div>
        )}
        {totals.voucherTotal > 0 && (
          <div className={styles.row}>
            <h4>Total vouchers</h4>
            <p className={styles.discount}>-{getAmount(Math.round(totals.voucherTotal), currencyCode)}</p>
          </div>
        )}
        <div className={styles.divider} />
        <div className={styles.row}>
          <h3>Grand total</h3> <h3>{getAmount(Math.round(totals.grandTotal), currencyCode)}</h3>
        </div>
      </>
    ) : (
      <Loader inverted />
    )}
  </div>
);

export default Totals;
