import { useTranslations } from 'next-intl';
import React from 'react';
import MyGiftCard from '@/src/components/profile/myGiftCard';
import { useCart } from '@/src/context/cartContext';
import { useCartCalculations } from '@/src/hooks/useCartCalculations';
import CartItem from './CartItem';
import { CartSummary } from './CartSummary';
import { CheckoutButton } from './CheckoutButton';

export function CartSheet() {
  const { setMiniCartOpen, cart, giftCardProducts } = useCart();
  const t = useTranslations();
  const hasItems = (cart?.items?.length ?? 0) > 0 || giftCardProducts?.length > 0;
  const onClose = () => setMiniCartOpen(false);
  const { itemsCount } = useCartCalculations(cart?.items, giftCardProducts);
  const subtitle = `${t('cart.you_have')} ${itemsCount} ${itemsCount > 1 ? t('cart.items') : t('cart.item')} ${t('cart.in_your_cart')}`;
  return (
    <>
      <div className={'flex items-center justify-between pt-4'}>
        <h2 className={' font-sans text-[0.8rem] font-light text-black'}>{subtitle}</h2>
      </div>
      <hr className={' mt-8 h-[0.08rem] '} />
      <div className={'w-full'}>
        {cart && hasItems ? (
          <div className={'mx-0 mt-5 border-gray-300'}>
            {giftCardProducts.map((card) => (
              <MyGiftCard key={card.id} card={card} className={'mt-5 flex border-b border-creme px-16 pb-5'} />
            ))}
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          // Empty cart
          <p className={'py-6 font-light'}>No items in cart</p>
        )}
      </div>

      {!!cart && hasItems && (
        <>
          <CartSummary cart={cart} itemsCount={itemsCount} />
          <CheckoutButton onClose={onClose} />
        </>
      )}
    </>
  );
}
