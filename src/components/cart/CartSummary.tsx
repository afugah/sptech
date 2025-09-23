import { useTranslations } from 'next-intl';
import { useLocale } from 'use-intl';
import { getAmount } from '@/src/helpers/money';
import { type Cart } from '@/src/types/cart';

interface CartSummaryProps {
  cart: Cart;
  itemsCount?: number;
}

export const CartSummary = ({ cart }: CartSummaryProps) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className={'h-full px-3 pt-3 text-sm uppercase xs:px-8 lg:px-12'}>
      {/* <div className={'flex justify-between'}>
        <span>
          {itemsCount} {itemsCount > 1 ? t('cart.items') : t('cart.item')}
        </span>
        <span>{getAmount(Number(cart?.totals.subTotal), cart?.currencyCode ?? '')}</span>
      </div> */}

      {/* {cart?.totals.discountTotal > 0 && (
        <div className={'mt-2 flex justify-between text-red'}>
          <span>{t('cart.discount')}</span>
          <span>-{getAmount(Number(cart?.totals.discountTotal), cart?.currencyCode ?? '')}</span>
        </div>
      )} */}

      <div className={'mt-2 flex items-center justify-between bg-white px-6 py-8'}>
        <span className={'text-sm'}>{t('cart.total-price')}</span>
        <span className={'text-2xl uppercase'}>
          {getAmount(Number(cart?.totals.grandTotal), cart?.currencyCode ?? '', locale)}
        </span>
      </div>
    </div>
  );
};
