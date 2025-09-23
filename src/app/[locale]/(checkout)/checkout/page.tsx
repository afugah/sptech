'use client';

export const dynamic = 'force-dynamic';

import { Dialog } from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'use-intl';
import BonusVoucherList from '@/src/components/checkout/BonusVoucherList/List';
import BonusVoucherOptions from '@/src/components/checkout/BonusVoucherList/Options';
import { CheckoutCartItem } from '@/src/components/checkout/CartItem';
import DiscountVoucherCode from '@/src/components/checkout/Discount/index';
import { FreeShippingBanner } from '@/src/components/checkout/FreeShippingBanner';
// import CountrySelector from '@/src/components/countrySelect/CountrySelector';
import GiftCardItem from '@/src/components/checkout/GiftCardItem';
import KlarnaCheckout from '@/src/components/checkout/KlarnaCheckout';
import { Button } from '@/src/components/ui/Button';
import { useAnalytics } from '@/src/context/analytics/analyticsContext';
import { useUser } from '@/src/context/authContext';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { useUserDrawer } from '@/src/context/userDrawerContext';
import { useVoyado } from '@/src/context/voyadoContext';
import { getAmount } from '@/src/helpers/money';
import InfoSvg from '@/src/images/icons/info.svg';
import { fetchProductStock } from '@/src/lib/api/clientApi';
import { UserModalViewEnum } from '@/src/lib/types/common';

interface IProps {
  params: Promise<{ locale: string }>;
}

const Page: React.FC<IProps> = () => {
  const { cart, cartToken, capabilities, giftCardProducts } = useCart();
  const { checkout, startCheckout, setPaymentProvider, paymentProvider, allowedDespiteStock } = useCheckout();
  const { isSignedIn } = useUser();
  const { setShowView } = useUserDrawer();
  const { customer } = useVoyado();
  const t = useTranslations();
  const locale = useLocale();

  const { emit } = useAnalytics();

  const previousQuantities = useRef(new Map());
  const previousCartToken = useRef<string | null>(null);
  const previousCart = useRef<typeof cart | null>(null);
  const [shouldBlockCheckout, setShouldBlockCheckout] = useState(false);
  const [checkoutValidationLoading, setCheckoutValidationLoading] = useState(false);

  const activateLoginModal = false;

  // Function to validate if checkout should be blocked based on stock and validateStock settings
  const validateCheckoutAvailability = useCallback(async () => {
    if (!cart?.items?.length) {
      setShouldBlockCheckout(false);
      return;
    }

    setCheckoutValidationLoading(true);

    try {
      const stockChecks = await Promise.all(
        cart.items.map(async (item) => {
          try {
            // First check if validateStock is in the cart item's custom attributes
            const validateStockFromItem = item.customAttributes?.validateStock;
            const itemValidateStock =
              validateStockFromItem === 'false' ? false : validateStockFromItem === 'true' ? true : undefined;

            const stockData = await fetchProductStock(item.productParentId, 'SE');
            const variantStock = stockData.find((stock) => stock.id === item.productVariantId);

            if (!variantStock) return { shouldBlock: false, item };

            const totalStock = variantStock.inventories.reduce((sum, inv) => sum + inv.quantity, 0);

            // Priority order for validateStock:
            // 1. Cart item custom attributes
            // 2. Stock response (if we implement it in the API)
            // 3. Default to true (current behavior)
            const validateStockValue = itemValidateStock ?? variantStock.validateStock ?? true;
            const shouldBlock = totalStock === 0 && validateStockValue;

            return {
              shouldBlock,
              item,
              stock: totalStock,
              validateStock: variantStock.validateStock,
              itemValidateStock,
              effectiveValidateStock: validateStockValue,
              reason: shouldBlock
                ? 'out-of-stock-with-validation'
                : totalStock === 0
                  ? 'out-of-stock-no-validation'
                  : 'in-stock',
            };
          } catch (error) {
            console.error(`Error fetching stock for ${item.productVariantId}:`, error);
            // If we can't fetch stock, assume it's available to avoid blocking checkout
            return { shouldBlock: false, item };
          }
        }),
      );

      // Block checkout only if there are items that should block (out of stock with validateStock: true)
      const hasBlockingItems = stockChecks.some((check) => check.shouldBlock);

      setShouldBlockCheckout(hasBlockingItems);
    } catch (error) {
      console.error('Error validating checkout availability:', error);
      // If validation fails, don't block checkout to avoid false negatives
      setShouldBlockCheckout(false);
    } finally {
      setCheckoutValidationLoading(false);
    }
  }, [cart?.items]);

  useEffect(() => {
    if (cart?.items) {
      emit({
        type: 'begin_checkout',
        item: cart.items,
      });

      previousQuantities.current = new Map(cart.items.map((item) => [item.id, item.quantity]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emit]); // Runs only once when the page loads

  useEffect(() => {
    if (!cart?.items) return;

    cart.items.forEach((item) => {
      const prevQuantity = previousQuantities.current.get(item.id) || 0;
      if (item.quantity > prevQuantity) {
        emit({
          type: 'begin_checkout',
          item: [
            {
              ...item,
              quantity: item.quantity - prevQuantity, // Only track the increased amount
            },
          ],
        });
      }
    });

    previousQuantities.current = new Map(cart.items.map((item) => [item.id, item.quantity]));
  }, [cart?.items, emit]);

  // Validate checkout availability when cart changes
  useEffect(() => {
    validateCheckoutAvailability();
  }, [validateCheckoutAvailability]);

  useEffect(() => {
    const provider = capabilities?.paymentProviders.find(() => true);
    if (!provider) return;

    setPaymentProvider(provider);
  }, [capabilities?.paymentProviders, setPaymentProvider]);

  useEffect(() => {
    if (!cartToken || !capabilities || !paymentProvider || checkoutValidationLoading) return;

    const isCartTokenChanged = previousCartToken.current !== cartToken;
    const isCartChanged = previousCart.current !== cart;

    if (!isCartTokenChanged && !isCartChanged) return;

    // Only start checkout if our validation doesn't block it
    if (!shouldBlockCheckout) {
      startCheckout(cartToken, capabilities, paymentProvider);
    }

    previousCartToken.current = cartToken;
    previousCart.current = cart;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartToken, capabilities, paymentProvider, cart, shouldBlockCheckout, checkoutValidationLoading]);

  const itemsCounts = useMemo(() => {
    const regularItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
    const giftCardCount = giftCardProducts?.length || 0;
    return regularItemsCount + giftCardCount;
  }, [cart?.items, giftCardProducts]);

  // const isGiftCardEnabled = process.env.NEXT_PUBLIC_GIFT_CARDS === 'true' && !!capabilities?.giftCardProviders?.length;

  return (
    <div className={'mx-auto mb-8 flex flex-col gap-y-8 pt-14 md:mb-16 md:pt-40 lg:max-w-screen-xl lg:px-10'}>
      <h1 className={'mb-5 mt-10 text-center font-serif text-4xl uppercase md:text-6xl'}>{t('cart.order-summary')}</h1>

      <div className={'flex w-full flex-col gap-y-6 bg-white p-4 sm:p-6 lg:gap-y-8'}>
        {giftCardProducts.map((card) => (
          <GiftCardItem key={card.id} card={card} className={''} />
        ))}
        <div className={' space-y-6'}>
          <div className={''}>
            <div className={' hidden w-full lg:block'}>
              <div className={'  grid grid-cols-[350px_1fr_1fr_1fr_1fr_1fr_80px] border-b border-gray-300 pb-6 '}>
                {['cart', 'material', 'size', 'price', 'quantity', 'total', ''].map((item, index) => (
                  <p
                    className={`${item === 'cart' ? ' font-serif text-xl capitalize' : 'flex items-center justify-center text-xxs uppercase'}  font-semibold  text-black/65 `}
                    key={index}
                  >
                    {item ? t(`checkout-page.table-headers.${item}`) : ''}
                  </p>
                ))}
              </div>
            </div>
            <div
              className={
                'border-b border-gray-300 pb-3 text-center font-serif text-3xl capitalize md:text-4xl lg:hidden'
              }
            >
              {t('checkout-page.order-summary')}
            </div>
            <div>{cart?.items?.map((item) => <CheckoutCartItem item={item} key={item.id} />)}</div>
            {cart?.items.length! > 0 ? (
              <>
                <div className={'mt-8 flex justify-center lg:hidden'}>
                  <Dialog>
                    <DiscountVoucherCode />
                  </Dialog>
                </div>
                <div className={'mt-0 flex items-center justify-between py-1 pt-3 md:mt-3'}>
                  <span className={'text-sm font-semibold uppercase'}>{t('checkout-page.items-total')}</span>
                  <div className={'hidden lg:block'}>
                    <Dialog>
                      <DiscountVoucherCode />
                    </Dialog>
                  </div>
                  <span className={'text-sm font-medium uppercase'}>
                    {getAmount(Number(cart?.totals.grandTotal), cart?.currencyCode ?? '', locale)}
                  </span>
                </div>
              </>
            ) : (
              <p className={' pt-2 text-center'}>{t('checkout-page.no-item-in-cart')}</p>
            )}
          </div>
        </div>
      </div>
      <div className={'bg-white px-4 py-4 sm:px-5 sm:py-6'}>
        <div className={' border-b pb-3'}>
          <p className={'font-serif text-xl capitalize sm:text-2xl'}>{t('checkout-page.order-summary')}</p>
          <div className={'mt-2 flex items-center justify-between  py-1 pt-3'}>
            <span className={'text-sm font-semibold uppercase'}>{t('checkout-page.items-total')}</span>

            <span className={'text-sm font-medium uppercase'}>
              {getAmount(Number(cart?.totals.grandTotal), cart?.currencyCode ?? '', locale)}
            </span>
          </div>
        </div>
        <div className={' flex items-center justify-between  py-1 pt-5'}>
          <span className={'font-serif text-2xl font-medium uppercase sm:text-3xl'}>{t('cart.total-price')}</span>

          <span className={'text-xl font-medium uppercase sm:text-2xl'}>
            {getAmount(Number(cart?.totals.grandTotal), cart?.currencyCode ?? '', locale)}
          </span>
        </div>
      </div>

      {(checkout && !shouldBlockCheckout) || allowedDespiteStock ? (
        <div>
          <div className={'grid grid-cols-1 gap-2 text-sm uppercase sm:grid-cols-2 sm:gap-4'}>
            {/* FEATURE: VOUCHERS - Ony show voucher for se */}
            {customer?.vouchers?.items && (cart?.items?.length ?? 0) > 0 && <BonusVoucherOptions />}
            {/* END FEATURE: VOUCHERS */}
            {/* <div className={'col-span-2'}>
              <div className={'flex flex-col items-start gap-6 pb-10 pt-3'}>
                <Discount checkout={checkout} />
                {isGiftCardEnabled && <CheckoutGiftCards />}
              </div>
            </div> */}

            {((checkout?.totals.discountTotal ?? 0) > 0 || (checkout?.totals.giftCardTotal ?? 0) > 0) && (
              <div className={'col-span-1 flex justify-between sm:contents'}>
                <span>
                  {itemsCounts} {itemsCounts > 1 ? t('cart.items') : t('cart.item')}
                </span>
                <span className={'text-right sm:text-right'}>
                  {getAmount(Number(checkout?.totals.subTotal), cart?.currencyCode ?? '', locale)}
                </span>
              </div>
            )}
            {/* FEATURE: VOUCHERS - Ony show voucher list in development */}
            {customer?.vouchers?.items && (cart?.items?.length ?? 0) > 0 && <BonusVoucherList />}
            {/* END FEATURE: VOUCHERS */}

            {(checkout?.totals.discountTotal ?? 0) -
              (cart?.discountExternals?.reduce((acc, discount) => acc + (discount.discountAmount || 0), 0) ?? 0) >
              0 && (
              <div className={'col-span-1 flex justify-between sm:contents'}>
                <span className={'text-red'}>{t('cart.discount')}</span>
                <span className={'text-right text-red'}>
                  -
                  {getAmount(
                    (checkout?.totals.discountTotal ?? 0) -
                      (cart?.discountExternals?.reduce((acc, discount) => acc + (discount.discountAmount || 0), 0) ??
                        0),
                    cart?.currencyCode ?? '',
                    locale,
                  )}
                </span>
              </div>
            )}

            {(checkout?.totals.giftCardTotal ?? 0) > 0 && (
              <div className={'col-span-1 flex justify-between sm:contents'}>
                <span>{t('cart.giftcard')}</span>
                <span className={'text-right text-red'}>
                  -{getAmount(checkout?.totals.giftCardTotal ?? 0, cart?.currencyCode ?? '', locale)}
                </span>
              </div>
            )}

            {process.env.NODE_ENV !== 'production' && (
              <div className={'col-span-1 flex justify-between sm:contents'}>
                <span>{t('cart.shipping')}</span>
                <span className={'text-right'}>
                  {getAmount(checkout?.totals.shippingTotal ?? 0, cart?.currencyCode ?? '', locale)}
                </span>
              </div>
            )}

            <div className={'col-span-1 flex justify-between font-semibold sm:contents'}>
              <span>{t('cart.total-price')}</span>
              <span className={'text-right uppercase'}>
                {getAmount(checkout?.totals.grandTotal ?? 0, cart?.currencyCode ?? '', locale)}
              </span>
            </div>
          </div>

          {!isSignedIn && activateLoginModal ? (
            <div
              className={
                'mt-10 flex flex-col items-center justify-between gap-2 rounded-md bg-alabaster p-5 text-sm lg:flex-row lg:p-10'
              }
            >
              <div>
                <h3 className={'mb-4 font-sans text-sm uppercase'}>{t('cart.already-a-member')}</h3>

                <div className={'contents text-gray'}>
                  <p>{t('cart.member-login-text')}</p>
                  <p>
                    <span>{t('cart.not-member')} </span>
                    <span
                      className={'cursor-pointer text-black underline'}
                      onClick={() => setShowView(UserModalViewEnum.SIGN_UP)}
                    >
                      {t('cart.sign-up')}
                    </span>
                    <span> {t('cart.offer-text')}</span>
                  </p>
                </div>
              </div>

              <Button
                className={'px-8'}
                onClick={() => {
                  setShowView(UserModalViewEnum.LOGIN);
                }}
              >
                {t('account.login-text')}
              </Button>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div>
          <div
            className={
              'mb-20 flex flex-col items-center justify-center gap-2 rounded-lg border border-creme bg-alabaster px-8 py-5 text-center text-sm md:flex-row'
            }
          >
            <InfoSvg className={'h-5 w-5'} />
            {!cart?.items?.length ? (
              <span>{t('cart.empty')}</span>
            ) : shouldBlockCheckout ? (
              <span>{t('cart.out-of-stock-notification')} </span>
            ) : checkoutValidationLoading ? (
              <span>{t('checkout-page.loading-checkout')}</span>
            ) : (
              <span>
                {t('checkout-page.checkout-unavailable-debug', {
                  checkout: !!checkout,
                  shouldBlock: shouldBlockCheckout,
                  loading: checkoutValidationLoading,
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* <CountrySelector /> */}
      <FreeShippingBanner />

      {((!!checkout && !shouldBlockCheckout) || allowedDespiteStock) && <KlarnaCheckout />}
    </div>
  );
};

export default Page;
