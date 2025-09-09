// Maps countries to their URL locale - all use 'en' for single language setup
// All countries use English market (root URL with no prefix)
export const countryToMarketMapping: Record<string, string> = {
  // Target markets - 24 EU countries + Philippines
  Austria: 'en',
  Belgium: 'en',
  Bulgaria: 'en',
  'Czech Republic': 'en',
  Germany: 'en',
  Denmark: 'en',
  Estonia: 'en',
  Finland: 'en',
  France: 'en',
  Croatia: 'en',
  Hungary: 'en',
  Italy: 'en',
  Lithuania: 'en',
  Luxembourg: 'en',
  Latvia: 'en',
  Netherlands: 'en',
  Philippines: 'en',
  Poland: 'en',
  Portugal: 'en',
  Romania: 'en',
  Sweden: 'en',
  Slovenia: 'en',
  Slovakia: 'en',
  Spain: 'en',

  // Additional markets for future expansion
  Norway: 'en',
  'United Kingdom': 'en',
  Switzerland: 'en',
};

export const availableCountries = Object.keys(countryToMarketMapping);

// URL locale configuration (for routing only) - simplified for single language
export const marketConfigMapping = {
  en: { label: 'EN', countryCode: 'gb', currency: 'EUR' }, // Default to EUR for most markets
} as const;

export const supportedMarkets = Object.keys(marketConfigMapping) as Array<keyof typeof marketConfigMapping>;

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
