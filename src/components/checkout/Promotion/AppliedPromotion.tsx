import React from 'react';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';
import styles from './AppliedPromotion.module.css';
interface Props {
  promotionName: string;
  amount: number;
}

export default function AppliedPromotion({ promotionName, amount }: Props) {
  const { store } = useCart();

  return (
    <>
      <li key={promotionName} className={styles.appliedPromotionContainer}>
        <span>{promotionName}</span>-{getAmount(amount, store.currencyCode)}
      </li>
    </>
  );
}
