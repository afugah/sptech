import React from 'react';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';
import styles from './AppliedVoucher.module.css';

interface Props {
  promotionName: string;
  amount: number;
}

export default function AppliedVoucher({ promotionName, amount }: Props) {
  const { store } = useCart();

  return (
    <li key={promotionName} className={styles.appliedVoucherContainer}>
      <span>{promotionName}</span>-{getAmount(amount, store.currencyCode)}
    </li>
  );
}
