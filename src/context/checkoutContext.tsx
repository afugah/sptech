'use client';

import { type KlarnaCheckoutResponse } from '@lib/types/klarnacheckout';
import React, { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from 'react';
import { useCart } from '@/src/context/cartContext';
import useLocalStorage from '@/src/hooks/useLocalStorage';
import {
  type ShopperCapabilities,
  type ShopperCapabilitiesProvider,
  type ShopperCheckout,
  type ShopperCheckoutResponse,
} from '@/src/lib/types/session';
import { type IRetain24 } from '@/src/types/api/gift-cards';

// Define the checkout context type with only the properties that are currently used
export type CheckoutContext = {
  clearCheckout: () => void;
  startCheckout: (
    token: string,
    capabilities: ShopperCapabilities,
    paymentProvider?: ShopperCapabilitiesProvider,
  ) => Promise<ShopperCheckoutResponse>;
  getCheckout: (token?: string) => void;
  checkout: ShopperCheckout | undefined;
  token: string | undefined;
  addDiscountCode: (code: string) => Promise<void>;
  deleteDiscountCode: (code: string) => Promise<void>;
  startIngridSession: (locale: string) => Promise<void>;
  ingridHtmlSnippet: string | undefined;
  syncIngridSession: () => Promise<void>;
  setPostalCode: Dispatch<SetStateAction<string>>;
  postalCode: string;
  addRetain24GiftCard: (body: IRetain24.GiftCartUseRequest) => Promise<void>;
  deleteRetain24GiftCard: (giftCardId: string) => Promise<void>;
  checkoutLoaded: boolean;
  paymentProvider: ShopperCapabilitiesProvider | undefined;
  setPaymentProvider: Dispatch<SetStateAction<ShopperCapabilitiesProvider | undefined>>;
  step: string;
  setStep: Dispatch<SetStateAction<string>>;
  setIngridHtmlSnippet: Dispatch<SetStateAction<string | undefined>>;
  allowedDespiteStock: boolean;

  // Klarna is always included since it's the primary payment provider
  createKlarnaOrder: (checkoutUrl: string, confirmationUrl: string) => Promise<void>;
  syncKlarnaOrder: () => void;
  klarnaOrder: KlarnaCheckoutResponse | undefined;

  // When restoring other payment providers, add their properties here
  // Example for Adyen:
  // startAdyenSession?: (adyenOptions: AdyenSessionsRequest) => void;
  // adyenSession?: AdyenSessionsResponse;
};

const CheckoutContext = createContext<CheckoutContext>({} as CheckoutContext);

type CheckoutProviderProps = {
  children: ReactNode;
};

const CheckoutProvider = ({ children }: CheckoutProviderProps) => {
  const [shopperCheckout, setShopperCheckout] = useState<ShopperCheckoutResponse | undefined>(undefined);
  const [checkoutToken, setCheckoutToken] = useLocalStorage<string | undefined>('checkout-token', undefined);
  const [, setLastOrder] = useLocalStorage<KlarnaCheckoutResponse | null>('lastOrder', null);
  const [ingridHtmlSnippet, setIngridHtmlSnippet] = useState<string>();
  const [klarnaOrder, setKlarnaOrder] = useState<KlarnaCheckoutResponse | undefined>(undefined);
  const [klarnaUrl, setKlarnaUrl] = useState<{ checkoutUrl: string; confirmationUrl: string }>();

  const [postalCode, setPostalCode] = useState<string>('');
  const [checkoutLoaded, setCheckoutLoaded] = useState<boolean>(false);
  const [appliedGiftCards, setAppliedGiftCards] = useState<IRetain24.GiftCartUseRequest[]>([]);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<ShopperCapabilitiesProvider | undefined>();
  const [step, setStep] = useState<string>('');
  const [isAllowedDespiteStock, setIsAllowedDespiteStock] = useState<boolean>(false);

  const { getSession } = useCart();

  const clearCheckout = () => {
    setShopperCheckout(undefined);
    setPostalCode('');
    setCheckoutToken(undefined);
    setStep('');
    setIsAllowedDespiteStock(false);
  };
  const startCheckout = async (
    token: string,
    capabilities: ShopperCapabilities,
    paymentProvider?: ShopperCapabilitiesProvider,
  ) => {
    try {
      setStep('shipping');
      setKlarnaOrder(undefined);
      setIngridHtmlSnippet(undefined);
      setCheckoutLoaded(false);
      const response = await fetch('/api/checkout/start-checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingProvider: capabilities?.shippingProviders[0],
          paymentProvider: paymentProvider ?? selectedPaymentProvider ?? capabilities?.paymentProviders[0],
          giftCardProvider: capabilities?.giftCardProviders[0],
          voucherProvider: { id: 'Voyado_Engage_Test', name: 'Voyado' },
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const res = await response.json();

      // Handle special case where checkout was allowed despite stock issues
      if (res.allowedDespiteStock) {
        // Instead of creating a fake checkout, try to get the current cart data
        // and create a checkout with the cart information
        try {
          const cartResponse = await fetch(`/api/session/get-session`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${res.token || token}`,
            },
          });
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            // Create a minimal but more complete checkout object based on cart data
            const checkoutObj = {
              token: res.token || checkoutToken || token,
              checkout: {
                id: cartData.cart?.id || 'temp-checkout-id',
                countryCode: cartData.cart?.countryCode || 'SE',
                currencyCode: cartData.cart?.currencyCode || 'SEK',
                languageCode: cartData.cart?.languageCode || 'en',
                isTaxIncludedInPrice: true,
                discountCodes: cartData.cart?.discountCodes || [],
                discountExternals: cartData.cart?.discountExternals || [],
                capabilities: {
                  paymentProvider: capabilities?.paymentProviders[0] || { id: 'klarna', name: 'Klarna' },
                  shippingProvider: capabilities?.shippingProviders[0] || { id: 'ingrid', name: 'Ingrid' },
                  giftCardProvider: capabilities?.giftCardProviders[0] || { id: 'retain24', name: 'Retain24' },
                  voucherProvider: { id: 'voyado', name: 'Voyado' },
                },
                giftCards: [],
                vouchers: [],
                items: cartData.cart?.items || [],
                totals: {
                  subTotal: cartData.cart?.totals?.subTotal || 0,
                  discountTotal: cartData.cart?.totals?.discountTotal || 0,
                  shippingTotal: 0,
                  giftCardTotal: 0,
                  voucherTotal: 0,
                  taxTotal: cartData.cart?.totals?.taxTotal || 0,
                  grandTotal: cartData.cart?.totals?.grandTotal || 0,
                },
                allowedDespiteStock: true,
              },
            } as unknown as ShopperCheckoutResponse;
            setShopperCheckout(checkoutObj);
            setCheckoutToken(checkoutObj.token);
            setLastOrder(null);
            setCheckoutLoaded(true);
            setIsAllowedDespiteStock(true);
          } else {
            throw new Error('Could not fetch cart data');
          }
        } catch (error) {
          console.error('Error creating checkout from cart data:', error);
          // Fallback: set a flag that we're in a special state
          setShopperCheckout(undefined);
          setCheckoutToken(res.token || checkoutToken || token);
          setCheckoutLoaded(true);
          setIsAllowedDespiteStock(true);
          // We'll handle this case in the UI
        }
      } else {
        setShopperCheckout(res);
        setCheckoutToken(res.token);
        setLastOrder(null);
        setCheckoutLoaded(true);
        setIsAllowedDespiteStock(false);
      }
      if (appliedGiftCards.length > 0) {
        let delay = 0;
        const delayIncrement = 600;
        const promises = appliedGiftCards.map(async (giftCard) => {
          delay += delayIncrement;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return addRetain24GiftCard(giftCard, res.token);
        });
        await Promise.all(promises);
      }
      return res;
    } catch (error) {
      console.error('start checkout', error);
      throw error;
    }
  };

  const getCheckout = async (token?: string) => {
    await fetch('/api/checkout/get-checkout', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token ?? shopperCheckout?.token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        setShopperCheckout(res);
        setCheckoutToken(res.token);
        setLastOrder(null);
      })
      .catch((error) => console.error(error));
  };

  const addDiscountCode = async (code: string) => {
    await fetch('/api/checkout/add-discount-code', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
      body: JSON.stringify({
        discountCode: code,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        getSession();
        // startCheckout(shopperCheckout?.token ?? '', res.capabilities);
      })
      .catch((error) => {
        throw error;
      });
  };

  const deleteDiscountCode = async (code: string) => {
    await fetch(`/api/checkout/delete-discount-code/?discountCode=${code}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        getSession();
        // startCheckout(shopperCheckout?.token ?? '', res.capabilities);
      })
      .catch((error) => console.error(error));
  };

  const startIngridSession = async (locale: string) => {
    await fetch('/api/checkout/ingrid/create-session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
      body: JSON.stringify({
        ingrid: {
          locales: [locale],
          postalCode: postalCode ?? '',
        },
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        setIngridHtmlSnippet(res.htmlSnippet);
      })
      .catch((error) => console.error(error));
  };

  const syncIngridSession = async () => {
    if (checkoutLoaded) {
      await fetch('/api/checkout/ingrid/sync-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${shopperCheckout?.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          if (typeof res !== 'string') {
            setIngridHtmlSnippet(res?.htmlSnippet);
            getCheckout();
          }
        })
        .catch((error) => console.error(error));
    }
  };

  const createKlarnaOrder = async (checkoutUrl: string, confirmationUrl: string) => {
    setKlarnaUrl({ checkoutUrl, confirmationUrl });

    await fetch('/api/checkout/klarna/create-order', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
      body: JSON.stringify({
        klarna: {
          merchant_urls: {
            terms: `${window.location.origin}/terms-and-conditions`,
            checkout: checkoutUrl,
            confirmation: confirmationUrl,
          },
          shipping_address: {
            postal_code: postalCode,
          },
          billing_address: {
            postal_code: postalCode,
          },
        },
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(errorData.error || errorData.message || res.statusText);
        }
        return res.json();
      })
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        setKlarnaOrder(res);
      })
      .catch((error) => {
        console.error('Klarna order creation failed:', error);
        throw error;
      });
  };

  const syncKlarnaOrder = async () => {
    if (klarnaOrder) {
      await fetch('/api/checkout/klarna/sync-order', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${shopperCheckout?.token}`,
        },
        body: JSON.stringify({
          klarna: {
            shipping_address: {
              postal_code: postalCode,
            },
            billing_address: {
              postal_code: postalCode,
            },
          },
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText);
          }
          return res.json();
        })
        .then((res) => {
          setKlarnaOrder(res);
        })
        .catch((error) => {
          console.error(error);
          if (klarnaUrl) {
            createKlarnaOrder(klarnaUrl.checkoutUrl, klarnaUrl.confirmationUrl);
          }
        });
    }
  };

  const addRetain24GiftCard = async (body: IRetain24.GiftCartUseRequest, token = shopperCheckout?.token) =>
    await fetch('/api/checkout/retain24/gift-card', {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: res.statusText }));
          const message = 'error' in data ? data.error : 'message' in data ? data.message : res.statusText;
          throw new Error(message);
        }
      })
      .then(async () => {
        if (!appliedGiftCards.some((giftCard) => giftCard.id === body.id)) {
          setAppliedGiftCards([...appliedGiftCards, body]);
        }
        await getCheckout(token);
      })
      .catch((error) => {
        console.error(error);
        throw new Error(error);
      });

  const deleteRetain24GiftCard = async (giftCardId: string) =>
    await fetch(`/api/checkout/retain24/gift-card/${giftCardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${shopperCheckout?.token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);

        setAppliedGiftCards(appliedGiftCards.filter((giftCard) => giftCard.id !== giftCardId));
        getCheckout();
      })
      .catch((error) => console.error(error));

  return (
    <CheckoutContext.Provider
      value={{
        clearCheckout,
        startCheckout,
        getCheckout,
        checkout: shopperCheckout?.checkout,
        token: checkoutToken,
        addDiscountCode,
        deleteDiscountCode,
        startIngridSession,
        ingridHtmlSnippet,
        syncIngridSession,
        setPostalCode,
        postalCode,
        addRetain24GiftCard,
        deleteRetain24GiftCard,
        checkoutLoaded,
        paymentProvider: selectedPaymentProvider,
        setPaymentProvider: setSelectedPaymentProvider,
        step,
        setStep,
        setIngridHtmlSnippet,
        allowedDespiteStock: isAllowedDespiteStock,

        // Klarna is always included as the primary payment provider
        createKlarnaOrder,
        syncKlarnaOrder,
        klarnaOrder,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
export default CheckoutProvider;

export const useCheckout = () => useContext(CheckoutContext);
