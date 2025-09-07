import { type FeedbackBuilder } from '@/src/context/findifyAnalytics/findifyAnalyticsEventBuilder';

export type FeedbackEvent = 'click-item' | 'purchase' | 'update-cart' | 'add-to-cart' | 'view-page';

type FeedbackProperties =
  | { event: 'click-item'; properties: { item_id: string; variant_item_id: string } }
  | {
      event: 'purchase';
      properties: {
        order_id: string;
        currency: string;
        revenue: number;
        total_discount?: number;
        total_tax?: number;
        total_shipping?: number;
        affiliation?: string;
        line_items: FindifyLineItem[];
      };
    }
  | {
      event: 'update-cart';
      properties: {
        line_items: FindifyLineItem[];
      };
    }
  | {
      event: 'add-to-cart';
      properties: {
        item_id: string;
        variant_item_id: string;
        quantity: number;
        rid: string;
      };
    }
  | {
      event: 'view-page';
      properties: {
        url: string;
        ref: string;
        width: number;
        height: number;
        item_id?: string;
        variant_item_id?: string;
      };
    };

export interface FeedbackBody<T extends FeedbackEvent> {
  event: T;
  properties: FeedbackProperties extends { event: T } ? Extract<FeedbackProperties, { event: T }>['properties'] : never;
}

export interface FindifyLineItem {
  item_id: string;
  variant_item_id: string;
  unit_price: number;
  quantity: number;
}

export interface FindifyAnalyticsContextType {
  builder: FeedbackBuilder<FeedbackEvent> | null;
  emitFeedback: (event: {
    type: FeedbackEvent;
    properties: FeedbackBody<FeedbackEvent>['properties'];
  }) => Promise<void>;
  // emitCartUpdateFeedback: (cart: ShopperCart | undefined) => void;
}
