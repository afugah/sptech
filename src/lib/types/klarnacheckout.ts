import { type KlarnaResponse } from '@/src/app/[locale]/(success)/success/klarnacheckout/confirmation/helper';

// Using a type alias instead of an empty interface extension
export type KlarnaCheckoutResponse = KlarnaResponse;

export interface KlarnaCheckoutOrder {
  order_id: string;
  status: string;
  html_snippet: string;
}
