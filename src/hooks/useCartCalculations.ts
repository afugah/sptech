import { useMemo } from 'react';
import { type ShopperGiftCardItem } from '@/src/lib/types/session';
import { type CartItem } from '@/src/types/cart';

export const useCartCalculations = (items: CartItem[] = [], giftCardProducts: ShopperGiftCardItem[] = []) => {
  const itemsCount = useMemo(() => {
    const regularItemsCount = items?.length || 0;
    const giftCardCount = giftCardProducts?.length || 0;
    return regularItemsCount + giftCardCount;
  }, [items, giftCardProducts]);

  return {
    itemsCount,
  };
};
