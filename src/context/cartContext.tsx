'use client';

import { setCookie } from 'cookies-next';
import { useLocale } from 'next-intl';
import React, {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import { getCountryFromMarket, getCurrencyForCountry } from '@/src/lib/constants/markets';
import {
  type CartProviders,
  type RequestAddItem,
  type RequestSessionStart,
  type RequestUpdateItem,
  type ShopperCapabilities,
  type ShopperCart,
  type ShopperGiftCardItem,
  type ShopperSessionResponse,
  type ShopperVoyadoVoucher,
} from '@/src/lib/types/session';
import { type IRetain24 } from '@/src/types/api/gift-cards';

export type CartContext = {
  miniCartOpen: boolean;
  setMiniCartOpen: Dispatch<SetStateAction<boolean>>;

  updateStore: (countryCode: string, currency?: string) => void;

  startSession: (reStart?: boolean, isLogout?: boolean) => Promise<ShopperSessionResponse | null>;
  getSession: () => Promise<ShopperSessionResponse | void>;

  addToCart: (body: RequestAddItem) => Promise<ShopperSessionResponse | null | void>;
  updateItemInCart: (body: RequestUpdateItem) => Promise<void>;
  deleteItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  startSessionWithNewMemberLevel: (cart?: ShopperCart, isLogout?: boolean) => Promise<void>;
  addRetain24GiftCardToCart: (body: IRetain24.GiftCartProductRequest) => Promise<void>;
  deleteRetain24GiftCardFromCart: (giftCardId: string) => Promise<void>;
  getStoreGroupIdFromLocalStorage: () => string | undefined;
  giftCardProducts: ShopperGiftCardItem[];
  cart: ShopperCart | undefined;
  cartProviders: CartProviders | undefined;
  capabilities: ShopperCapabilities | undefined;
  cartToken: string | undefined;
  numberOfCartItems: number | undefined;
  store: RequestSessionStart;
  vouchers: ShopperVoyadoVoucher[] | [];
  isSessionLoaded?: boolean;
};

const CartContext = createContext<CartContext>({} as CartContext);

type CartProviderProps = {
  children: ReactNode;
};
export type LocaleTypes = 'sv' | 'fi' | 'nb' | 'en';

const CartProvider = ({ children }: CartProviderProps) => {
  const locale = useLocale();
  const defaultStore = useMemo(() => {
    // The locale is actually the market code (e.g., 'se', 'no', 'dk', 'ph')
    const marketCode = locale;

    // Get the country name from the market code
    const country = getCountryFromMarket(marketCode);

    // Get the currency for this country
    const currency = getCurrencyForCountry(country);

    // Map country to country code for Brink Commerce
    const countryCodeMap: Record<string, string> = {
      Sweden: 'SE',
      Finland: 'FI',
      Norway: 'NO',
      Denmark: 'DK',
      Germany: 'DE',
      'United Kingdom': 'GB',
      Philippines: 'PH',
      // Add more as needed
    };

    const countryCode = countryCodeMap[country] || 'SE';

    // Return appropriate store configuration based on market
    return {
      countryCode,
      languageCode: marketCode === 'se' ? 'sv' : marketCode === 'fi' ? 'fi' : 'en',
      currencyCode: currency,
    };
  }, [locale]);

  const [miniCartOpen, setMiniCartOpen] = useState<boolean>(false);
  const [sessions, setSessions, isSessionLoaded] = useLocalStorage<
    Partial<Record<LocaleTypes, ShopperSessionResponse>>
  >('sessions', {});
  const [store, setStore] = useLocalStorage<RequestSessionStart>('store', defaultStore);
  const updateStore = useCallback(
    (country: string, currency?: string) => {
      // Map country names to country codes
      const countryCodeMap: Record<string, string> = {
        Sweden: 'SE',
        Finland: 'FI',
        Norway: 'NO',
        Denmark: 'DK',
        Germany: 'DE',
        'United Kingdom': 'GB',
        'United States of America': 'US',
        France: 'FR',
        Spain: 'ES',
        Italy: 'IT',
        Netherlands: 'NL',
        Belgium: 'BE',
        Austria: 'AT',
        Switzerland: 'CH',
        Poland: 'PL',
        'Czech Republic': 'CZ',
        Estonia: 'EE',
        Latvia: 'LV',
        Lithuania: 'LT',
        Ireland: 'IE',
        Portugal: 'PT',
        Greece: 'GR',
        Croatia: 'HR',
        Luxembourg: 'LU',
        Malta: 'MT',
        Cyprus: 'CY',
        Iceland: 'IS',
        Canada: 'CA',
        Australia: 'AU',
        'New Zealand': 'NZ',
        Japan: 'JP',
        China: 'CN',
        'Hong Kong': 'HK',
        Singapore: 'SG',
        India: 'IN',
        'South Korea': 'KR',
        Brazil: 'BR',
        Mexico: 'MX',
        'South Africa': 'ZA',
        Israel: 'IL',
        Turkey: 'TR',
        Philippines: 'PH',
        // Add more as needed
      };

      // Get the country code from the country name, or use the first 2 letters as fallback
      const countryCode = countryCodeMap[country] || country.slice(0, 2).toUpperCase();

      // Determine the language code based on country for better Klarna localization
      const languageCodeMap: Record<string, string> = {
        Sweden: 'sv-SE',
        Finland: 'fi-FI',
        Norway: 'nb-NO',
        Denmark: 'da-DK',
        Germany: 'de-DE',
        Austria: 'de-AT',
        Switzerland: 'de-CH',
        Netherlands: 'nl-NL',
        Belgium: 'nl-BE', // Could also be fr-BE for French-speaking Belgium
        France: 'fr-FR',
        Spain: 'es-ES',
        Italy: 'it-IT',
        Poland: 'pl-PL',
        'Czech Republic': 'cs-CZ',
        Portugal: 'pt-PT',
        Greece: 'el-GR',
        'United Kingdom': 'en-GB',
        Ireland: 'en-IE',
        'United States of America': 'en-US',
        Canada: 'en-CA', // Could also be fr-CA for French-speaking Canada
        Australia: 'en-AU',
        'New Zealand': 'en-NZ',
        // Add more specific locales as needed
      };

      // Get the language code from the map, or default to English
      const languageCode = languageCodeMap[country] || 'en-GB';

      // Create the store configuration with the provided currency
      const storeConfig = {
        countryCode,
        languageCode,
        currencyCode: currency || 'USD',
      };

      setStore(storeConfig);
    },
    [setStore],
  );

  useEffect(() => {
    setCookie('countryCode', store.countryCode);
    // Update store if it doesn't match the current market
    if (store.countryCode !== defaultStore.countryCode) {
      setStore(defaultStore);
    }
  }, [defaultStore, setStore, store, store.countryCode]);

  const clearCart = () => {
    setSessions({ ...sessions, [locale]: undefined });
  };
  const currentSession = useMemo(() => sessions[locale as LocaleTypes], [locale, sessions]);
  const existingGiftCardProducts = currentSession?.giftCardProducts ?? [];
  const variantInCart = (productVariantId: string) => {
    if (currentSession?.cart?.items) {
      return currentSession?.cart.items.find((item) => item.productVariantId === productVariantId);
    }
    return null;
  };
  const persistGiftCardProducts = (session: ShopperSessionResponse) =>
    session.giftCardProducts?.length ? session?.giftCardProducts : existingGiftCardProducts;

  const updateItemInCart = async (body: RequestUpdateItem) => {
    if (currentSession) {
      await updateItem({ quantity: body.quantity, itemId: body.itemId }, currentSession!.token);
    }
  };
  const updateSession = async (
    body: RequestAddItem,
    token: string,
    retryOnForbidden = true,
  ): Promise<ShopperSessionResponse | null> => {
    try {
      const res = await fetch(`/api/session/update-session`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.status === 403 && retryOnForbidden) {
        console.error('Session token expired or invalid. Refreshing session...');
        const newSession = await startSession(true);
        if (!newSession) {
          console.error('Failed to refresh session.');
          return null;
        }
        return await updateSession(body, newSession.token, false);
      }

      if (!res.ok) {
        console.error(`Update session failed: ${res.status} ${res.statusText}`);
        throw new Error(`Update session failed: ${res.statusText}`);
      }

      const session = await res.json();

      if (session.error) {
        console.error(`Session update error: ${session.error}`);

        // Only clear cart for critical session errors that invalidate the entire cart
        if (
          session.error.includes('invalid session') ||
          session.error.includes('cart corrupted') ||
          session.error.includes('session expired')
        ) {
          console.error('Critical session error. Clearing cart.');
          clearCart();
          setMiniCartOpen(false);
        }

        throw new Error(`Session update error: ${session.error}`);
      }
      setSessions({
        ...sessions,
        [locale as LocaleTypes]: {
          ...session,
          giftCardProducts: persistGiftCardProducts(session),
        },
      });
      return session;
    } catch (error) {
      console.error('Failed to update session', error);
      return null;
    }
  };

  const startSession = useCallback(
    async (reStart?: boolean, isLogout?: boolean) => {
      if (!currentSession?.cart?.id || reStart) {
        try {
          const res = await fetch(`/api/session/start-session?isLogout=${isLogout ? 1 : 0}`, {
            method: 'POST',
            body: JSON.stringify(store),
          });
          if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
          const session = await res.json();
          if (session.message) throw new Error(`Session error: ${session.message}`);
          setSessions({
            ...sessions,
            [locale as LocaleTypes]: {
              ...session,
              giftCardProducts: persistGiftCardProducts(session),
            },
          });
          return session;
        } catch (error) {
          console.error('Error in startSession', error);
          return null;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSession?.cart?.id, store, sessions, locale, setSessions],
  );
  const deleteItemFromCart = async (itemId: string) => {
    if (currentSession) {
      await deleteItem(itemId, currentSession!.token);
    }
  };
  const startSessionWithNewMemberLevel = async (cart?: ShopperCart, isLogout?: boolean) => {
    if (cart) {
      try {
        const session = await startSession(true, isLogout);
        if (!session?.token) {
          throw new Error('Session token is missing');
        }
        const items = cart.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })) as unknown as RequestAddItem[];
        const itemsCall = items.map((item) =>
          updateSession(item, session.token).catch((error) => {
            console.error(`Failed to update item `, error);
          }),
        );
        await Promise.all(itemsCall);
      } catch (error) {
        console.error('Error starting session with new member level:', error);
      }
    }
  };
  const addToCart = async (body: RequestAddItem): Promise<ShopperSessionResponse | null | void> => {
    const item = variantInCart(body.productVariantId);
    if (!currentSession) {
      const newSession = await startSession();
      if (!newSession) {
        console.error('Failed to start a session');
        return;
      }
      return await updateSession(body, newSession.token);
    }
    if (item) {
      return await updateItemInCart({ quantity: body.quantity + item.quantity, itemId: item.id });
    }
    try {
      return await updateSession(body, currentSession.token);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  };
  const addRetain24GiftCardToCart = async (body: IRetain24.GiftCartProductRequest) => {
    if (currentSession) {
      await addRetain24GiftCard(body, currentSession?.token);
    } else await startSession().then((result: ShopperSessionResponse) => addRetain24GiftCard(body, result?.token));

    await getSession();
  };

  const deleteRetain24GiftCardFromCart = async (giftCardId: string) => {
    if (currentSession) await deleteRetain24GiftCard(giftCardId, currentSession?.token);

    await getSession();
  };

  /* #region API */

  const updateItem = async (body: RequestUpdateItem, token: string) => {
    await fetch(`/api/session/update-item`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        setSessions({
          ...sessions,
          [locale as LocaleTypes]: { ...res, giftCardProducts: persistGiftCardProducts(res) },
        });
      })
      .catch((error) => console.error(error));
  };

  const deleteItem = async (itemId: string, token: string) => {
    await fetch(`/api/session/delete-item/?itemId=${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        setSessions({
          ...sessions,
          [locale as LocaleTypes]: { ...res, giftCardProducts: persistGiftCardProducts(res) },
        });
      })
      .catch((error) => console.error(error));
  };

  const getSession = async () => {
    const sessionResponse = await fetch('/api/session/get-session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${currentSession?.token}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));

    if (!sessionResponse.error) {
      setSessions({
        ...sessions,
        [locale as LocaleTypes]: { ...sessionResponse, giftCardProducts: persistGiftCardProducts(sessionResponse) },
      });
      return sessionResponse;
    }
  };
  const getStoreGroupIdFromLocalStorage = () => {
    const storeGroupId = currentSession?.cart?.storeGroupId;
    return storeGroupId;
  };
  const addRetain24GiftCard = async (body: IRetain24.GiftCartProductRequest, token: string) => {
    await fetch('/api/session/retain24/gift-card', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .catch((error) => console.error(error));
  };

  const deleteRetain24GiftCard = async (giftCardId: string, token: string) => {
    await fetch(`/api/session/retain24/gift-card/${giftCardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .catch((error) => console.error(error));
  };

  /* #endregion */

  const numberOfCartItems =
    (currentSession?.cart?.items?.length || 0) + (currentSession?.giftCardProducts?.length || 0);

  const contextObject = {
    miniCartOpen,
    setMiniCartOpen,
    startSession,
    getSession,
    addToCart,
    updateItemInCart,
    deleteItemFromCart,
    clearCart,
    addRetain24GiftCardToCart,
    deleteRetain24GiftCardFromCart,
    startSessionWithNewMemberLevel,
    getStoreGroupIdFromLocalStorage,
    cart: currentSession?.cart,
    cartProviders: currentSession?.cartProviders,
    capabilities: currentSession?.capabilities,
    vouchers: currentSession?.vouchers ?? [],
    numberOfCartItems,
    store,
    giftCardProducts: currentSession?.giftCardProducts ?? [],
    updateStore,
    cartToken: currentSession?.token,
    isSessionLoaded,
  };

  return <CartContext.Provider value={contextObject}>{children}</CartContext.Provider>;
};
export default CartProvider;

export const useCart = () => useContext(CartContext);
