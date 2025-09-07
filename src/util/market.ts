import { availableCountries, countryToMarketMapping, marketConfigMapping } from '@/src/lib/constants/markets';
import { type IMarketConfig, type MarketCode } from '@/src/types/market';

export const getMarketByCountry = (countryName: string): MarketCode | undefined => {
  const market = countryToMarketMapping[countryName];
  return market as MarketCode | undefined;
};

export const getCountriesByMarket = (marketCode: MarketCode): string[] => {
  return availableCountries.filter((country) => countryToMarketMapping[country] === marketCode);
};

export const getDefaultCountryForMarket = (marketCode: MarketCode): string => {
  const countries = getCountriesByMarket(marketCode);
  return countries[0] || 'Sweden';
};

export const getMarketConfig = (marketCode: MarketCode): IMarketConfig | undefined => {
  return marketConfigMapping[marketCode];
};

export const isValidCountry = (countryName: string): boolean => {
  return countryName in countryToMarketMapping;
};

export const isValidMarket = (marketCode: string): marketCode is MarketCode => {
  return marketCode in marketConfigMapping;
};

export const resolveCountryForMarket = (marketCode: MarketCode, preferredCountry?: string): string => {
  if (preferredCountry && isValidCountry(preferredCountry) && getMarketByCountry(preferredCountry) === marketCode) {
    return preferredCountry;
  }

  return getDefaultCountryForMarket(marketCode);
};
