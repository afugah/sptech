'use client';

import React, { createContext, type ReactNode, useContext, useMemo } from 'react';
import {
  type CartProviders,
  type ShopperCapabilities,
  type ShopperCart,
  type ShopperGiftCardItem,
} from '@/src/lib/types/session';

/**
 * Cart state context - handles read-only cart state
 * Optimized for performance with proper memoization
 */

interface CartState {
  cart: ShopperCart | undefined;
  cartProviders: CartProviders | undefined;
  capabilities: ShopperCapabilities | undefined;
  giftCardProducts: ShopperGiftCardItem[];
  miniCartOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CartStateContextValue extends CartState {
  // Computed values
  itemCount: number;
  totalPrice: number;
  hasItems: boolean;
  isEmpty: boolean;
  // Item utilities
  findItemById: (itemId: string) => ShopperCart['items'][0] | undefined;
  findVariantInCart: (variantId: string) => ShopperCart['items'][0] | undefined;
  isItemInCart: (variantId: string) => boolean;
}

const CartStateContext = createContext<CartStateContextValue | undefined>(undefined);

interface CartStateProviderProps {
  children: ReactNode;
  value: CartState;
}

export const CartStateProvider: React.FC<CartStateProviderProps> = React.memo(({ children, value }) => {
  // Memoize computed values to prevent unnecessary recalculations
  const contextValue = useMemo<CartStateContextValue>(() => {
    const { cart } = value;
    const items = cart?.items || [];

    // Compute derived state
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + (((item as unknown as Record<string, unknown>).price as number) || 0) * item.quantity,
      0,
    );
    const hasItems = items.length > 0;
    const isEmpty = items.length === 0;

    // Create item lookup functions
    const findItemById = (itemId: string) => items.find((item) => item.id === itemId);
    const findVariantInCart = (variantId: string) => items.find((item) => item.productVariantId === variantId);
    const isItemInCart = (variantId: string) => items.some((item) => item.productVariantId === variantId);

    return {
      ...value,
      itemCount,
      totalPrice,
      hasItems,
      isEmpty,
      findItemById,
      findVariantInCart,
      isItemInCart,
    };
  }, [value]);

  return <CartStateContext.Provider value={contextValue}>{children}</CartStateContext.Provider>;
});

CartStateProvider.displayName = 'CartStateProvider';

export const useCartState = (): CartStateContextValue => {
  const context = useContext(CartStateContext);
  if (!context) {
    throw new Error('useCartState must be used within a CartStateProvider');
  }
  return context;
};

// Selector hooks for specific state slices to minimize re-renders
export const useCartItems = () => {
  const { cart } = useCartState();
  return useMemo(() => cart?.items || [], [cart?.items]);
};

export const useCartSummary = () => {
  const { itemCount, totalPrice, hasItems, isEmpty } = useCartState();
  return useMemo(() => ({ itemCount, totalPrice, hasItems, isEmpty }), [itemCount, totalPrice, hasItems, isEmpty]);
};

export const useCartCapabilities = () => {
  const { capabilities } = useCartState();
  return capabilities;
};

export const useCartProviders = () => {
  const { cartProviders } = useCartState();
  return cartProviders;
};

export const useMiniCartState = () => {
  const { miniCartOpen } = useCartState();
  return miniCartOpen;
};

export const useCartLoading = () => {
  const { isLoading, error } = useCartState();
  return useMemo(() => ({ isLoading, error }), [isLoading, error]);
};
