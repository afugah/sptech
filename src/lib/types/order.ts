import { type CustomAttributes, type Tags } from './common';

export interface Order {
  id: string;
  reference: string;
  countryCode: string;
  currencyCode: string;
  languageCode: string;
  IsTaxIncludedInPrice: boolean;
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  orderLines: OrderLine[];
  orderTotals: OrderTotals;
}

export interface OrderAddress {
  givenName: string;
  familyName: string;
  city: string;
  country: string;
  houseNumberOrName: string;
  postalCode: string;
  stateOrProvince: string;
  street: string;
}

export interface OrderLine {
  id: string;
  productVariantId: string;
  productParentId: string;
  quantity: number;
  name: string;
  displayName: string;
  description: string;
  displayDescription: string;
  taxGroupId: string;
  basePriceAmount: number;
  salePriceAmount: number;
  discountAmount: number;
  totalDiscountAmount: number;
  totalPriceAmount: number;
  taxPercentage: number;
  taxPercentageDecimals: number;
  totalTaxAmount: number;
  imageUrl: string;
  slug: string;
  customAttributes: CustomAttributes;
  tags: Tags;
}

export interface OrderTotals {
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
}
