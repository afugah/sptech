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

export type MarketCode =
  | 'at'
  | 'be'
  | 'bg'
  | 'cz'
  | 'de'
  | 'dk'
  | 'ee'
  | 'fi'
  | 'fr'
  | 'hr'
  | 'hu'
  | 'it'
  | 'lt'
  | 'lu'
  | 'lv'
  | 'nl'
  | 'ph'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'se'
  | 'si'
  | 'sk'
  | 'es'
  | 'no'
  | 'gb'
  | 'ch';

export type SupportedMarkets = {
  [K in MarketCode]: IMarketConfig;
};
