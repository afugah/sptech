'use client';

import { setCookie } from 'cookies-next';
import { useLocale } from 'next-intl';
import React, { type ReactNode, useMemo, useState } from 'react';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import {
  type CartProviders,
  type RequestAddItem,
  type RequestUpdateItem,
  type ShopperCart,
  type ShopperGiftCardItem,
  type ShopperSessionResponse,
} from '@/src/lib/types/session';
import { type IRetain24 } from '@/src/types/api/gift-cards';
import { CartActionsProvider } from './CartActionsContext';
import { CartStateProvider } from './CartStateContext';

/**
 * Composite cart provider that combines state and actions
 * Optimized for performance with proper separation of concerns
 */

interface CartCompositeProviderProps {
  children: ReactNode;
}

export const CartCompositeProvider: React.FC<CartCompositeProviderProps> = ({ children }) => {
  const locale = useLocale();

  // Local state
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local storage state
  const [sessions, setSessions] = useLocalStorage<Partial<Record<string, ShopperSessionResponse>>>('sessions', {});
  const [store, setStore] = useLocalStorage<string>('store', 'SE');

  // Current session from locale
  const currentSession = useMemo(() => sessions[locale], [sessions, locale]);

  // Cart state
  const cartState = useMemo(
    () => ({
      cart: currentSession?.cart,
      cartProviders: (currentSession as unknown as Record<string, unknown>)?.providers as CartProviders | undefined,
      capabilities: currentSession?.capabilities,
      giftCardProducts: currentSession?.giftCardProducts || [],
      miniCartOpen,
      isLoading,
      error,
    }),
    [currentSession, miniCartOpen, isLoading, error],
  );

  // Error handling utility
  const handleError = (error: unknown, operation: string) => {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error in ${operation}:`, error);
    setError(message);
    setIsLoading(false);
  };

  // API utilities
  const updateSession = async (body: RequestAddItem, token: string): Promise<ShopperSessionResponse> => {
    const response = await fetch('/api/session/update', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const deleteItem = async (itemId: string, token: string): Promise<void> => {
    const response = await fetch('/api/session/delete-item', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  const updateItem = async (body: RequestUpdateItem, token: string): Promise<ShopperSessionResponse> => {
    const response = await fetch('/api/session/update-item', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const addRetain24GiftCard = async (body: IRetain24.GiftCartProductRequest, token: string): Promise<void> => {
    const response = await fetch('/api/session/gift-card', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  const deleteRetain24GiftCard = async (giftCardId: string, token: string): Promise<void> => {
    const response = await fetch('/api/session/gift-card', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ giftCardId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  };

  const persistGiftCardProducts = (session: ShopperSessionResponse): ShopperGiftCardItem[] => {
    return session.giftCardProducts || [];
  };

  // Cart actions
  const cartActions = useMemo(() => {
    // Helper to find variant in cart
    const variantInCart = (variantId: string) => {
      return currentSession?.cart?.items.find((item) => item.productVariantId === variantId);
    };

    return {
      startSession: async (reStart = false, isLogout = false): Promise<ShopperSessionResponse | null> => {
        if (!reStart && currentSession?.cart?.id && !isLogout) {
          return currentSession;
        }

        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const session: ShopperSessionResponse = await response.json();

          setSessions((prevSessions) => ({
            ...prevSessions,
            [locale]: {
              ...session,
              giftCardProducts: persistGiftCardProducts(session),
            },
          }));

          setIsLoading(false);
          return session;
        } catch (error) {
          handleError(error, 'startSession');
          return null;
        }
      },

      getSession: async (): Promise<ShopperSessionResponse | void> => {
        if (!currentSession?.token) return;

        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/session', {
            headers: { Authorization: `Bearer ${currentSession.token}` },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const session: ShopperSessionResponse = await response.json();

          setSessions((prevSessions) => ({
            ...prevSessions,
            [locale]: {
              ...session,
              giftCardProducts: persistGiftCardProducts(session),
            },
          }));

          setIsLoading(false);
          return session;
        } catch (error) {
          handleError(error, 'getSession');
        }
      },

      updateStore: (countryCode: string) => {
        setStore(countryCode);
        setCookie('store', countryCode, { maxAge: 60 * 60 * 24 * 365 });
      },

      addToCart: async (body: RequestAddItem): Promise<ShopperSessionResponse | null | void> => {
        const item = variantInCart(body.productVariantId);

        if (!currentSession) {
          const newSession = await cartActions.startSession();
          if (!newSession) {
            throw new Error('Failed to start a session');
          }
          return await updateSession(body, newSession.token);
        }

        if (item) {
          await cartActions.updateItemInCart({
            quantity: body.quantity + item.quantity,
            itemId: item.id,
          });
          return currentSession;
        }

        try {
          setIsLoading(true);
          const updatedSession = await updateSession(body, currentSession.token);

          setSessions((prevSessions) => ({
            ...prevSessions,
            [locale]: {
              ...updatedSession,
              giftCardProducts: persistGiftCardProducts(updatedSession),
            },
          }));

          setIsLoading(false);
          return updatedSession;
        } catch (error) {
          handleError(error, 'addToCart');
          return null;
        }
      },

      updateItemInCart: async (body: RequestUpdateItem): Promise<void> => {
        if (!currentSession) return;

        try {
          setIsLoading(true);
          const updatedSession = await updateItem(body, currentSession.token);

          setSessions((prevSessions) => ({
            ...prevSessions,
            [locale]: {
              ...updatedSession,
              giftCardProducts: persistGiftCardProducts(updatedSession),
            },
          }));

          setIsLoading(false);
        } catch (error) {
          handleError(error, 'updateItemInCart');
        }
      },

      deleteItemFromCart: async (itemId: string): Promise<void> => {
        if (!currentSession) return;

        try {
          setIsLoading(true);
          await deleteItem(itemId, currentSession.token);
          await cartActions.getSession(); // Refresh session
        } catch (error) {
          handleError(error, 'deleteItemFromCart');
        }
      },

      clearCart: () => {
        setSessions((prevSessions) => ({
          ...prevSessions,
          [locale]: undefined,
        }));
      },

      startSessionWithNewMemberLevel: async (cart?: ShopperCart, isLogout = false): Promise<void> => {
        if (!cart) return;

        try {
          setIsLoading(true);
          const session = await cartActions.startSession(true, isLogout);

          if (!session?.token) {
            throw new Error('Session token is missing');
          }

          const items = cart.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })) as RequestAddItem[];

          // Update all items in parallel
          await Promise.allSettled(items.map((item) => updateSession(item, session.token)));

          await cartActions.getSession(); // Refresh session
        } catch (error) {
          handleError(error, 'startSessionWithNewMemberLevel');
        }
      },

      addRetain24GiftCardToCart: async (body: IRetain24.GiftCartProductRequest): Promise<void> => {
        try {
          setIsLoading(true);

          if (currentSession) {
            await addRetain24GiftCard(body, currentSession.token);
          } else {
            const session = await cartActions.startSession();
            if (session?.token) {
              await addRetain24GiftCard(body, session.token);
            }
          }

          await cartActions.getSession(); // Refresh session
        } catch (error) {
          handleError(error, 'addRetain24GiftCardToCart');
        }
      },

      deleteRetain24GiftCardFromCart: async (giftCardId: string): Promise<void> => {
        if (!currentSession) return;

        try {
          setIsLoading(true);
          await deleteRetain24GiftCard(giftCardId, currentSession.token);
          await cartActions.getSession(); // Refresh session
        } catch (error) {
          handleError(error, 'deleteRetain24GiftCardFromCart');
        }
      },

      setMiniCartOpen,

      getStoreGroupIdFromLocalStorage: () => {
        return store;
      },
    };
  }, [currentSession, store, locale, setSessions, setStore]);

  return (
    <CartStateProvider value={cartState}>
      <CartActionsProvider actions={cartActions}>{children}</CartActionsProvider>
    </CartStateProvider>
  );
};
