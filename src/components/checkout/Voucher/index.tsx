import VoucherIcon from '@images/icons/ticket.svg';
import React from 'react';
import { type ShopperCheckout } from '@/src/lib/types/session';
import sharedStyles from '../Shared.module.css';
import AppliedVoucher from './AppliedVoucher';
import styles from './AppliedVoucher.module.css';

type Props = {
  checkout: ShopperCheckout | undefined;
};

const Voucher = ({ checkout }: Props) => {
  return (
    <div className={styles.voucherContainer}>
      <div className={sharedStyles.checkoutTab}>
        <span>
          <VoucherIcon />
          Applied Vouchers
        </span>
      </div>
      {checkout && checkout.vouchers.length > 0 && (
        <ul className={styles.appliedVouchersContainer}>
          {checkout.vouchers.map((voucher) => (
            <AppliedVoucher key={voucher.id} promotionName={voucher.description} amount={voucher.amount} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Voucher;
