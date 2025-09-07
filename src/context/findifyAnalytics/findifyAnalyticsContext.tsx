import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useCart } from '@/src/context/cartContext';
import {
  type FeedbackBody,
  type FeedbackEvent,
  type FindifyAnalyticsContextType,
  type FindifyLineItem,
} from '@/src/context/findifyAnalytics/types';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { FeedbackBuilder } from './findifyAnalyticsEventBuilder';

function isPurchaseEvent(properties: FeedbackBody<FeedbackEvent>['properties']): properties is {
  order_id: string;
  currency: string;
  revenue: number;
  total_discount?: number;
  total_tax?: number;
  total_shipping?: number;
  affiliation?: string;
  line_items: FindifyLineItem[];
} {
  return (properties as { order_id: string }).order_id !== undefined;
}

function isUpdateCartEvent(properties: FeedbackBody<FeedbackEvent>['properties']): properties is {
  line_items: FindifyLineItem[];
} {
  return (properties as { line_items: FindifyLineItem[] }).line_items !== undefined;
}

function isAddToCartEvent(properties: FeedbackBody<FeedbackEvent>['properties']): properties is {
  item_id: string;
  variant_item_id: string;
  quantity: number;
} {
  return (properties as { item_id: string }).item_id !== undefined;
}

function isClickItemEvent(properties: FeedbackBody<FeedbackEvent>['properties']): properties is {
  item_id: string;
  variant_item_id: string;
} {
  return (properties as { item_id: string }).item_id !== undefined;
}

function isViewPageEvent(properties: FeedbackBody<FeedbackEvent>['properties']): properties is {
  url: string;
  ref: string;
  width: number;
  height: number;
  item_id?: string;
  variant_item_id?: string;
} {
  return (properties as { url: string }).url !== undefined;
}

const FindifyAnalyticsContext = createContext<FindifyAnalyticsContextType | undefined>(undefined);

const handleProperties = <T extends FeedbackEvent>(
  builder: FeedbackBuilder<FeedbackEvent>,
  eventType: T,
  properties: FeedbackBody<FeedbackEvent>['properties'],
) => {
  switch (eventType) {
    case 'click-item':
      if (isClickItemEvent(properties)) {
        builder.withItemId(properties.item_id).withVariantItemId(properties.variant_item_id);
      }
      break;
    case 'purchase':
      if (isPurchaseEvent(properties)) {
        builder
          .withOrderDetails({
            order_id: properties.order_id,
            currency: properties.currency,
            revenue: properties.revenue,
            total_discount: properties.total_discount || 0,
            total_tax: properties.total_tax || 0,
            total_shipping: properties.total_shipping || 0,
            affiliation: properties.affiliation || undefined,
          })
          .withLineItems(properties.line_items);
      }
      break;
    case 'update-cart':
      if (isUpdateCartEvent(properties)) {
        builder.withLineItems(properties.line_items);
      }
      break;
    case 'add-to-cart':
      if (isAddToCartEvent(properties)) {
        builder
          .withItemId(properties.item_id)
          .withVariantItemId(properties.variant_item_id)
          .withQuantity(properties.quantity);
      }
      break;
    case 'view-page':
      if (isViewPageEvent(properties)) {
        builder
          .withPageUrl(properties.url)
          .withRef(properties.ref)
          .withWidth(properties.width)
          .withHeight(properties.height);
      }
      break;
    default:
      break;
  }
};

const FindifyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [builder] = useState(new FeedbackBuilder<FeedbackEvent>());
  const marketCode = useMarketCode();
  const [customerData, setCustomerData] = useState<{ contactId?: string } | null>(null);
  const { cart } = useCart();

  // Get customer data from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCustomer = localStorage.getItem('customer');
        if (storedCustomer) {
          const parsedCustomer = JSON.parse(storedCustomer);
          setCustomerData(parsedCustomer);
        }
      } catch (error) {
        console.error('Error reading customer from localStorage:', error);
      }
    }
  }, []);

  const emitFeedback = useCallback(
    async (event: { type: FeedbackEvent; properties: FeedbackBody<FeedbackEvent>['properties'] }) => {
      if (typeof window === 'undefined') {
        console.warn('FindifyAnalytics can only be used in a client environment');
        return;
      }

      if (!cart && event.type === 'view-page') {
        const checkCartInterval = setInterval(() => {
          if (cart) {
            clearInterval(checkCartInterval);
            emitFeedback(event);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkCartInterval);
          console.warn('Timed out waiting for cart to load, sending event without cart data');
          _sendEvent(event);
        }, 1000);

        return;
      }

      await _sendEvent(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [builder, marketCode, customerData, cart],
  );

  const _sendEvent = async (event: { type: FeedbackEvent; properties: FeedbackBody<FeedbackEvent>['properties'] }) => {
    try {
      const response = await fetch('/api/findify-analytics/get-cookie-and-apikey', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ marketCode }),
      });

      const result = await response.json();
      const rid = result?.cookieValue?.value || '';

      if (!rid) {
        console.warn('Request ID (rid) is missing. Feedback will not be sent.');
        return;
      }

      const { default: FindifyAnalytics } = await import('@findify/analytics');
      // Create a custom function to handle events instead of letting the library
      // automatically bind to DOM elements
      const analyticsInstance = FindifyAnalytics({
        key: result?.apiKey,
        platform: 'generic',
        user: {
          uid: customerData?.contactId || cart?.id || localStorage.getItem('findify_uid') || `anonymous_${Date.now()}`,
          sid: cart?.sessionId || localStorage.getItem('findify_sid') || `session_${Date.now()}`,
        },
        // Use custom event handling instead of automatic DOM binding
        // This should prevent the library from modifying the document
        events: {
          // Disable automatic event tracking
          preventEvents: true,
        },
      });

      // Store IDs in localStorage as fallback for future events
      if (cart?.id && !localStorage.getItem('findify_uid')) {
        localStorage.setItem('findify_uid', cart.id);
      }
      if (cart?.sessionId && !localStorage.getItem('findify_sid')) {
        localStorage.setItem('findify_sid', cart.sessionId);
      }

      const props = { ...event.properties, rid };
      analyticsInstance.sendEvent(event.type, props);

      builder.reset().setEventType(event.type);
      handleProperties(builder, event.type, event.properties);
      // const builtEvent = builder.buildEvent();
      // try {
      //   const response = await fetch('/api/findify-analytics/post-feedback', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ marketCode, ...builtEvent }),
      //   });
      //
      //   const result = await response.json();
      //
      //   if (result.success) {
      //     // success
      //   } else {
      //     console.error('Failed to post feedback', result.message);
      //   }
      // } catch (error) {
      //   console.error('Error posting feedback:', error);
      // }
    } catch (error) {
      console.error('Error in emitFeedback:', error);
    }
  };

  return (
    <FindifyAnalyticsContext.Provider value={{ builder, emitFeedback }}>{children}</FindifyAnalyticsContext.Provider>
  );
};

export default FindifyProvider;

export const useFindifyAnalytics = () => {
  const context = useContext(FindifyAnalyticsContext);
  if (!context) {
    throw new Error('useFindifyAnalytics must be used within a FindifyProvider');
  }
  return context;
};
