export interface StoreGroup {
  id: string;
  name: string;
  description: string;
}

export interface StoreMarket {
  countryCode: string;
  currencyCode: string;
  isTaxIncludedInPrice: boolean;
}
