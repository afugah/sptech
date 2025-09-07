import { useTranslations } from 'next-intl';
import React from 'react';
import { useCart } from '@/src/context/cartContext';
import { useCartCalculations } from '@/src/hooks/useCartCalculations';
import MyGiftCard from '../profile/myGiftCard';
import { Drawer } from '../ui/Drawer';
import CartItem from './CartItem';
import { CartSummary } from './CartSummary';
import { CheckoutButton } from './CheckoutButton';

const Cart = () => {
  const { miniCartOpen, setMiniCartOpen, cart, giftCardProducts } = useCart();
  const t = useTranslations();
  const hasItems = (cart?.items?.length ?? 0) > 0 || giftCardProducts?.length > 0;
  const onClose = () => setMiniCartOpen(false);
  const { itemsCount } = useCartCalculations(cart?.items, giftCardProducts);
  const subtitle = `${t('cart.you_have')} ${itemsCount} ${itemsCount > 1 ? t('cart.items') : t('cart.item')} ${t('cart.in_your_cart')}`;

  return (
    <Drawer
      onClose={onClose}
      open={miniCartOpen}
      title={t('cart.shopping_cart')}
      titleClassName={'uppercase'}
      subtitle={subtitle}
      subtitleClassName={'text-sm font-light text-black'}
    >
      <div className={'w-full'}>
        {cart && hasItems ? (
          <div className={'mx-12 mt-5 border-t border-gray-300'}>
            {giftCardProducts.map((card) => (
              <MyGiftCard key={card.id} card={card} className={'mt-5 flex border-b border-creme px-16 pb-5'} />
            ))}
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} isOpen={miniCartOpen} />
            ))}
          </div>
        ) : (
          // Empty cart
          <p></p>
        )}
      </div>

      {!!cart && hasItems && (
        <>
          <CartSummary cart={cart} itemsCount={itemsCount} />
          <CheckoutButton onClose={onClose} />
        </>
      )}
    </Drawer>
  );
};

export default Cart;
