'use client';

import React, { createContext, type ReactNode, useContext, useMemo } from 'react';
import {
  type RequestAddItem,
  type RequestUpdateItem,
  type ShopperCart,
  type ShopperSessionResponse,
} from '@/src/lib/types/session';
import { type IRetain24 } from '@/src/types/api/gift-cards';

/**
 * Cart actions context - handles cart operations
 * Optimized with useCallback to prevent unnecessary re-renders
 */

interface CartActions {
  // Session management
  startSession: (reStart?: boolean, isLogout?: boolean) => Promise<ShopperSessionResponse | null>;
  getSession: () => Promise<ShopperSessionResponse | void>;
  updateStore: (countryCode: string) => void;

  // Cart operations
  addToCart: (body: RequestAddItem) => Promise<ShopperSessionResponse | null | void>;
  updateItemInCart: (body: RequestUpdateItem) => Promise<void>;
  deleteItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;

  // Gift card operations
  addRetain24GiftCardToCart: (body: IRetain24.GiftCartProductRequest) => Promise<void>;
  deleteRetain24GiftCardFromCart: (giftCardId: string) => Promise<void>;

  // Advanced operations
  startSessionWithNewMemberLevel: (cart?: ShopperCart, isLogout?: boolean) => Promise<void>;

  // UI state
  setMiniCartOpen: (open: boolean) => void;

  // Utilities
  getStoreGroupIdFromLocalStorage: () => string | undefined;
}

const CartActionsContext = createContext<CartActions | undefined>(undefined);

interface CartActionsProviderProps {
  children: ReactNode;
  actions: CartActions;
}

export const CartActionsProvider: React.FC<CartActionsProviderProps> = React.memo(({ children, actions }) => {
  // Memoize all actions to prevent unnecessary re-renders of consuming components
  const memoizedActions = useMemo<CartActions>(
    () => ({
      // Session management
      startSession: actions.startSession,
      getSession: actions.getSession,
      updateStore: actions.updateStore,

      // Cart operations
      addToCart: actions.addToCart,
      updateItemInCart: actions.updateItemInCart,
      deleteItemFromCart: actions.deleteItemFromCart,
      clearCart: actions.clearCart,

      // Gift card operations
      addRetain24GiftCardToCart: actions.addRetain24GiftCardToCart,
      deleteRetain24GiftCardFromCart: actions.deleteRetain24GiftCardFromCart,

      // Advanced operations
      startSessionWithNewMemberLevel: actions.startSessionWithNewMemberLevel,

      // UI state
      setMiniCartOpen: actions.setMiniCartOpen,

      // Utilities
      getStoreGroupIdFromLocalStorage: actions.getStoreGroupIdFromLocalStorage,
    }),
    [actions],
  );

  return <CartActionsContext.Provider value={memoizedActions}>{children}</CartActionsContext.Provider>;
});

CartActionsProvider.displayName = 'CartActionsProvider';

export const useCartActions = (): CartActions => {
  const context = useContext(CartActionsContext);
  if (!context) {
    throw new Error('useCartActions must be used within a CartActionsProvider');
  }
  return context;
};

// Optional version of useCartActions that returns null when not in provider
export const useOptionalCartActions = (): CartActions | null => {
  const context = useContext(CartActionsContext);
  return context || null;
};

// Specific action hooks to minimize re-renders
export const useCartMutations = () => {
  const { addToCart, updateItemInCart, deleteItemFromCart, clearCart } = useCartActions();
  return useMemo(
    () => ({
      addToCart,
      updateItemInCart,
      deleteItemFromCart,
      clearCart,
    }),
    [addToCart, updateItemInCart, deleteItemFromCart, clearCart],
  );
};

export const useSessionActions = () => {
  const { startSession, getSession, updateStore, startSessionWithNewMemberLevel } = useCartActions();
  return useMemo(
    () => ({
      startSession,
      getSession,
      updateStore,
      startSessionWithNewMemberLevel,
    }),
    [startSession, getSession, updateStore, startSessionWithNewMemberLevel],
  );
};

export const useGiftCardActions = () => {
  const { addRetain24GiftCardToCart, deleteRetain24GiftCardFromCart } = useCartActions();
  return useMemo(
    () => ({
      addRetain24GiftCardToCart,
      deleteRetain24GiftCardFromCart,
    }),
    [addRetain24GiftCardToCart, deleteRetain24GiftCardFromCart],
  );
};

export const useMiniCartActions = () => {
  const { setMiniCartOpen } = useCartActions();
  return useMemo(() => ({ setMiniCartOpen }), [setMiniCartOpen]);
};
