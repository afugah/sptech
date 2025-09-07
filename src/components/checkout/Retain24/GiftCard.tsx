import GiftCardIcon from '@images/icons/gift-card.svg';
import CloseIcon from '@images/icons/xmark.svg';
import React, { type Dispatch, type SetStateAction } from 'react';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { getAmount } from '@/src/helpers/money';
import { type ShopperGiftCardItem } from '@/src/lib/types/session';
import styles from './GiftCard.module.css';

type Props = {
  giftCard: ShopperGiftCardItem;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

/**
 * @deprecated Will be removed
 */
export const Retain24GiftCard = ({ giftCard, setIsLoading }: Props) => {
  const { cart } = useCart();
  const { deleteRetain24GiftCard } = useCheckout();

  const onClickRemove = (id: string) => {
    setIsLoading(true);
    deleteRetain24GiftCard(id)
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  };
  return (
    <li key={giftCard.id} className={styles.appliedGiftCard}>
      <span>
        <GiftCardIcon /> {giftCard.id} <span>({getAmount(giftCard.amount, cart?.currencyCode ?? '')})</span>
      </span>
      <CloseIcon onClick={() => onClickRemove(giftCard.id)} />
    </li>
  );
};
