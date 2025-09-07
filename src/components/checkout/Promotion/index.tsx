import PromotionIcon from '@images/icons/badge.svg';
import React from 'react';
import { type ShopperCheckout } from '@/src/lib/types/session';
import sharedStyles from '../Shared.module.css';
import AppliedPromotion from './AppliedPromotion';
import styles from './AppliedPromotion.module.css';

type Props = {
  checkout: ShopperCheckout | undefined;
};

const Promotion = ({ checkout }: Props) => {
  return (
    <div className={styles.promotionContainer}>
      <div className={sharedStyles.checkoutTab}>
        <span>
          <PromotionIcon />
          Applied promotions
        </span>
      </div>
      {checkout && checkout.discountExternals.length > 0 && (
        <ul className={styles.appliedPromotionsContainer}>
          {checkout.discountExternals.map((discount) => (
            <AppliedPromotion key={discount.name} promotionName={discount.name} amount={discount.discountAmount} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Promotion;
