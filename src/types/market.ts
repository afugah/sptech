export interface IMarketConfig {
  label: string;
  countryCode: string;
  currency: string;
}

export interface ICountryMapping {
  [countryName: string]: string;
}

export interface IMarketSelectorHook {
  selectedCountry: string;
  availableCountries: string[];
  handleCountrySelect: (countryName: string) => void;
  isLoading?: boolean;
}

export interface IMarketSelectorProps {
  hasHeaderFixed?: boolean;
  bgColor?: boolean;
}

export type MarketCode = 'en';

export type SupportedMarkets = {
  [K in MarketCode]: IMarketConfig;
};
