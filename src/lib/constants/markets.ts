// Maps countries to their market URL codes
// Each country gets a specific market prefix in the URL (e.g., /se for Sweden)
export const countryToMarketMapping: Record<string, string> = {
  // Target markets - 24 EU countries + Philippines
  Austria: 'at',
  Belgium: 'be',
  Bulgaria: 'bg',
  'Czech Republic': 'cz',
  Germany: 'de',
  Denmark: 'dk',
  Estonia: 'ee',
  Finland: 'fi',
  France: 'fr',
  Croatia: 'hr',
  Hungary: 'hu',
  Italy: 'it',
  Lithuania: 'lt',
  Luxembourg: 'lu',
  Latvia: 'lv',
  Netherlands: 'nl',
  Philippines: 'ph',
  Poland: 'pl',
  Portugal: 'pt',
  Romania: 'ro',
  Sweden: 'se',
  Slovenia: 'si',
  Slovakia: 'sk',
  Spain: 'es',

  // Additional markets for future expansion
  Norway: 'no',
  'United Kingdom': 'gb',
  Switzerland: 'ch',
};

export const availableCountries = Object.keys(countryToMarketMapping);

// Market code to country mapping (reverse lookup)
export const marketToCountryMapping: Record<string, string> = {
  at: 'Austria',
  be: 'Belgium',
  bg: 'Bulgaria',
  cz: 'Czech Republic',
  de: 'Germany',
  dk: 'Denmark',
  ee: 'Estonia',
  fi: 'Finland',
  fr: 'France',
  hr: 'Croatia',
  hu: 'Hungary',
  it: 'Italy',
  lt: 'Lithuania',
  lu: 'Luxembourg',
  lv: 'Latvia',
  nl: 'Netherlands',
  ph: 'Philippines',
  pl: 'Poland',
  pt: 'Portugal',
  ro: 'Romania',
  se: 'Sweden',
  si: 'Slovenia',
  sk: 'Slovakia',
  es: 'Spain',
  no: 'Norway',
  gb: 'United Kingdom',
  ch: 'Switzerland',
};

export const supportedMarkets = Object.keys(marketToCountryMapping) as Array<keyof typeof marketToCountryMapping>;

// Currency mapping by country (independent of URL routing)
// This determines which currency to use for each country
// Supports: EUR, SEK, DKK, NOK, GBP
export const countryToCurrencyMapping: Record<string, string> = {
  // SEK countries
  Sweden: 'SEK',

  // DKK countries
  Denmark: 'DKK',

  // NOK countries
  Norway: 'NOK',

  // GBP countries
  'United Kingdom': 'GBP',

  // EUR countries (24 EU target markets + Philippines)
  // Target EU countries
  Austria: 'EUR',
  Belgium: 'EUR',
  Bulgaria: 'EUR',
  'Czech Republic': 'EUR',
  Germany: 'EUR',
  Estonia: 'EUR',
  Finland: 'EUR',
  France: 'EUR',
  Croatia: 'EUR',
  Hungary: 'EUR',
  Italy: 'EUR',
  Lithuania: 'EUR',
  Luxembourg: 'EUR',
  Latvia: 'EUR',
  Netherlands: 'EUR',
  Poland: 'EUR',
  Portugal: 'EUR',
  Romania: 'EUR',
  Slovenia: 'EUR',
  Slovakia: 'EUR',
  Spain: 'EUR',

  // Philippines (target market)
  Philippines: 'EUR',

  // Additional markets for future expansion
  Switzerland: 'EUR',
};

// Helper function to get currency for a country
export const getCurrencyForCountry = (country: string): string => {
  return countryToCurrencyMapping[country] || 'EUR';
};

// Helper function to get the currency key for pricing (e.g., 'price_sek', 'price_eur')
export const getCurrencyPriceKey = (country: string): string => {
  const currency = getCurrencyForCountry(country);
  return `price_${currency.toLowerCase()}`;
};

// Helper function to get the discount key for pricing (e.g., 'discount_sek', 'discount_eur')
export const getCurrencyDiscountKey = (country: string): string => {
  const currency = getCurrencyForCountry(country);
  return `discount_${currency.toLowerCase()}`;
};

// Helper function to get country from market code
export const getCountryFromMarket = (marketCode: string): string => {
  return marketToCountryMapping[marketCode] || 'Sweden';
};

// Helper function to get market code from country
export const getMarketFromCountry = (country: string): string => {
  return countryToMarketMapping[country] || 'se';
};

// Helper function to get the currently selected country from localStorage
export const getCurrentCountry = (): string => {
  if (typeof window === 'undefined') return 'Sweden'; // Default for SSR

  try {
    const stored = localStorage.getItem('selectedCountry');
    return stored || 'Sweden'; // Default to Sweden if not found
  } catch {
    return 'Sweden'; // Default on error
  }
};

// Market configuration mapping for UI display
export const marketConfigMapping = {
  at: { label: 'Austria', countryCode: 'AT', currency: 'EUR' },
  be: { label: 'Belgium', countryCode: 'BE', currency: 'EUR' },
  bg: { label: 'Bulgaria', countryCode: 'BG', currency: 'EUR' },
  cz: { label: 'Czech Republic', countryCode: 'CZ', currency: 'EUR' },
  de: { label: 'Germany', countryCode: 'DE', currency: 'EUR' },
  dk: { label: 'Denmark', countryCode: 'DK', currency: 'DKK' },
  ee: { label: 'Estonia', countryCode: 'EE', currency: 'EUR' },
  fi: { label: 'Finland', countryCode: 'FI', currency: 'EUR' },
  fr: { label: 'France', countryCode: 'FR', currency: 'EUR' },
  hr: { label: 'Croatia', countryCode: 'HR', currency: 'EUR' },
  hu: { label: 'Hungary', countryCode: 'HU', currency: 'EUR' },
  it: { label: 'Italy', countryCode: 'IT', currency: 'EUR' },
  lt: { label: 'Lithuania', countryCode: 'LT', currency: 'EUR' },
  lu: { label: 'Luxembourg', countryCode: 'LU', currency: 'EUR' },
  lv: { label: 'Latvia', countryCode: 'LV', currency: 'EUR' },
  nl: { label: 'Netherlands', countryCode: 'NL', currency: 'EUR' },
  ph: { label: 'Philippines', countryCode: 'PH', currency: 'EUR' },
  pl: { label: 'Poland', countryCode: 'PL', currency: 'EUR' },
  pt: { label: 'Portugal', countryCode: 'PT', currency: 'EUR' },
  ro: { label: 'Romania', countryCode: 'RO', currency: 'EUR' },
  se: { label: 'Sweden', countryCode: 'SE', currency: 'SEK' },
  si: { label: 'Slovenia', countryCode: 'SI', currency: 'EUR' },
  sk: { label: 'Slovakia', countryCode: 'SK', currency: 'EUR' },
  es: { label: 'Spain', countryCode: 'ES', currency: 'EUR' },
  no: { label: 'Norway', countryCode: 'NO', currency: 'NOK' },
  gb: { label: 'United Kingdom', countryCode: 'GB', currency: 'GBP' },
  ch: { label: 'Switzerland', countryCode: 'CH', currency: 'EUR' },
};
