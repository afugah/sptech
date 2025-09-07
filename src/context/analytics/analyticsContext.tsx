import { sendGTMEvent } from '@next/third-parties/google';
import { useLocale } from 'next-intl';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import GoogleTagManagerInit from '@/src/components/tracking/GoogleTagManagerInit';
import { AnalyticsEventBuilder } from '@/src/context/analytics/AnalyticsEventBuilder';
import { type IAnalyticsPayload } from '@/src/context/analytics/types';
import { useCart } from '@/src/context/cartContext';
import { useVoyado } from '@/src/context/voyadoContext';
import { usePathname } from '@/src/i18n/navigation';

export const AnalyticsContext = createContext<IPageContext>({} as IPageContext);

export type IPageContext = {
  /**
   * Emit an analytics event.
   *
   * To enable debug logs, set `window.analyticsDebug` to `true`.
   *
   * @param event - The event to emit.
   */
  emit: (event: IAnalyticsPayload) => Promise<void>;
};

/**
 * AnalyticsProvider
 *
 * Used to emit analytics events.
 *
 * To enable debug logs, set `window.analyticsDebug` to `true`.
 */
const AnalyticsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { customer } = useVoyado();
  const { store, cart } = useCart();

  const currency = useMemo(() => store?.currencyCode, [store]);

  /* #region Internals */

  const pathname = usePathname();
  const locale = useLocale();

  /* #region Wait for all possible dependencies to load */
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 300);
  }, []);
  /* #endregion */

  /* #region Event consumers */
  const sendEvent = useCallback((builder: AnalyticsEventBuilder, event: IAnalyticsPayload) => {
    if (window.analyticsDebug === true) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] Emit analytics event', builder.buildDebug());
    }

    if (process.env.NEXT_PUBLIC_GTM_ID) {
      if (event.type !== 'view_page') {
        sendGTMEvent({ ecommerce: null });
      }
      sendGTMEvent(builder.buildGtmEvent());
    }
  }, []);
  /* #endregion */

  /* #region Debounce events to prevent duplicate events within useEffect */
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const debouncedEmit = useCallback(
    (event: IAnalyticsPayload, builder: AnalyticsEventBuilder) => {
      const key = `${event.type};${pathname}`;

      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }

      debounceTimers.current[key] = setTimeout(() => {
        sendEvent(builder, event);

        delete debounceTimers.current[key];
      }, 1000);
    },
    [pathname, sendEvent],
  );
  /* #endregion */

  /* #endregion */

  const emit = useCallback(
    async (event: IAnalyticsPayload) => {
      const builder = new AnalyticsEventBuilder()
        .reset()
        .setEventType(event.type)
        .withLocale(locale)
        .withMarket('SWE')
        .withLanguage('sv-SE')
        .withCurrency(currency)
        .withContactId(customer?.contactId)
        .withCartItems(cart?.items);

      switch (event.type) {
        case 'view_page': // Trigger on every page load
          builder
            .setEventType('pageview')
            .withUrl(event.url)
            .withGtagType('hard')
            .withGtagCustomData({ value: { page_path: event.url } });
          break;

        case 'view_item': // Trigger on click on item on the grid
          builder
            .withTitle(event.item.title)
            .withUrl(event.item.slug)
            .withGtagType('dynamic')
            .withPageType('')
            .withItems(event.item)
            .withCategories(event.item);
          break;

        case 'product_detail_view': // Trigger on page load of product detail page
          builder
            .setEventType('productDetailView')
            .withTitle(event.item.title)
            .withUrl(event.item.slug)
            .withGtagType('dynamic')
            .withPageType('productDetail')
            .withItems(event.item)
            .withCategories(event.item);
          break;

        case 'virtual_page_load': // [NOT IMPLEMENTED] ? Trigger on page load of virtual page
          builder
            .setEventType('virtualPageLoad')
            .withTitle(event.item.title)
            .withUrl(event.item.slug)
            .withGtagType('hard')
            .withPageType('productDetail')
            .withItems(event.item)
            .withCategories(event.item);
          break;

        case 'add_to_cart': // Trigger on add to cart button click
          builder
            .withUrl(event.item.slug)
            .withSkus(event.item)
            .withGtagType('dynamic')
            .withPageType('productDetail')
            .withItems(event.item)
            .withItemListName(event.item_list_name)
            .withCartRef(cart?.id)
            .withCartItems(cart?.items)
            .withCategories(event.item);
          break;

        case 'remove_from_cart': // Trigger on remove from cart button click
          builder.withUrl(event.item.slug).withGtagType('dynamic').withPageType('productDetail');

          if ('productVariantId' in event.item) builder.withTitle(event.item.name).withItems(event.item);
          else builder.withTitle(event.item.title).withItems(event.item);

          if (cart?.items.length === 0) {
            builder.withCartRef(cart.id);
          }

          break;

        case 'begin_checkout': // Trigger on the checkout page load
          builder
            .withGtagType('dynamic')
            .setEventType('begin_checkout')
            .withItems(event.item)
            .withSkus(event.item)
            .withCartItems(event.item)
            .withCategories(event.item);
          break;

        case 'checkout': // Trigger on checkout finish
          builder
            .withGtagType('dynamic')
            .setEventType('checkout')
            .withSkus(event.item)
            .withItems(event.item)
            .withCartItems(event.item)
            .withCategories(event.item);
          break;

        case 'purchase': // Trigger on purchase
          builder
            .withGtagType('hard')
            .setEventType('purchase')
            .withItems(event.transaction.items)
            .withSkus(event.transaction.items)
            .withTransactionValue(event.transaction.value)
            .withCurrency(event.transaction.currency)
            .withTransactionId(event.transaction.transaction_id)
            .withTax(event.transaction.tax)
            .withCartRef(cart?.id)
            .withCategories(event.transaction.items)
            .withCoupon(event.transaction.coupon)
            .withShipping(event.transaction.shipping);
          break;

        case 'checkout_option': // [NOT IMPLEMENTED] ?
          break;

        case 'refund': // [NOT IMPLEMENTED] ?
          break;

        case 'refund_item': // [NOT IMPLEMENTED] ?
          break;
      }

      debouncedEmit(event, builder);
    },
    // Ignore all dependencies to prevent re-emitting events on cart/voyado updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedEmit, isLoaded],
  );

  useEffect(() => {
    emit({ type: 'view_page', url: pathname });
  }, [emit, pathname]);

  const contextObject: IPageContext = { emit };

  return (
    <AnalyticsContext.Provider value={contextObject}>
      {children}

      <GoogleTagManagerInit />
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;

export const useAnalytics = () => useContext(AnalyticsContext);
