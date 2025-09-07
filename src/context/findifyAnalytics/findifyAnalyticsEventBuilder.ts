import { isNil, omitBy } from 'lodash';
import { type FeedbackBody, type FeedbackEvent, type FindifyLineItem } from '@/src/context/findifyAnalytics/types';

type EventPropertiesMap = {
  'click-item': { item_id: string; variant_item_id: string };
  purchase: {
    order_id: string;
    currency: string;
    revenue: number;
    total_discount?: number;
    total_tax?: number;
    total_shipping?: number;
    affiliation?: string;
    line_items: FindifyLineItem[];
  };
  'update-cart': { line_items: FindifyLineItem[] };
  'add-to-cart': { item_id: string; variant_item_id: string; quantity: number; rid: string };
  'view-page': {
    url: string;
    ref: string;
    width: number;
    height: number;
    item_id?: string;
    variant_item_id?: string;
  };
};

// FeedbackBuilder class
export class FeedbackBuilder<T extends FeedbackEvent> {
  private _eventType: T | null = null;
  private _properties: Partial<FeedbackBody<FeedbackEvent>['properties']> | undefined = {};

  // Setter for the event type
  public setEventType(eventType: T): this {
    this._eventType = eventType;
    this._properties = {} as EventPropertiesMap[T]; // Directly initialize properties based on event type
    return this;
  }

  // Setters for properties
  public withItemId(itemId: string): this {
    this._properties = { ...this._properties, item_id: itemId };

    return this;
  }

  public withVariantItemId(variantItemId: string): this {
    this._properties = { ...this._properties, variant_item_id: variantItemId };
    return this;
  }

  public withLineItems(lineItems: FindifyLineItem[]): this {
    this._properties = { ...this._properties, line_items: lineItems };

    return this;
  }

  public withQuantity(quantity: number): this {
    this._properties = { ...this._properties, quantity: quantity };
    return this;
  }

  public withOrderDetails(orderDetails: {
    order_id: string;
    currency: string;
    revenue: number;
    total_discount?: number;
    total_tax?: number;
    total_shipping?: number;
    affiliation?: string;
  }): this {
    this._properties = { ...this._properties, ...orderDetails };
    return this;
  }

  public withPageUrl(url: string): this {
    this._properties = { ...this._properties, url };
    return this;
  }

  public withWidth(width: number): this {
    this._properties = { ...this._properties, width };
    return this;
  }

  public withHeight(height: number): this {
    this._properties = { ...this._properties, height };
    return this;
  }

  public withRef(ref: string): this {
    this._properties = { ...this._properties, ref };
    return this;
  }

  public buildEvent(): Record<string, unknown> {
    if (!this._eventType) {
      console.error('[FeedbackBuilder] Event type is required');
      return {};
    }

    const result = {
      event: this._eventType,
      properties: omitBy(this._properties, isNil),
    };

    return result;
  }

  public reset(): this {
    this._eventType = null;
    this._properties = undefined;
    return this;
  }
}
