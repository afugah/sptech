// Maps countries to their URL locale (se, fi, or en)
// This only affects URL routing, not currency
export const countryToMarketMapping: Record<string, string> = {
  // Swedish market (gets /sv/ URL prefix)
  Sweden: 'sv',

  // Finnish market (gets /fi/ URL prefix)
  Finland: 'fi',

  // All other countries use English market (root URL with no prefix)
  Denmark: 'en',
  Norway: 'en',
  Estonia: 'en',
  Latvia: 'en',
  Lithuania: 'en',
  'Åland Islands': 'en',
  Australia: 'en',
  Austria: 'en',
  Bahamas: 'en',
  Barbados: 'en',
  Belgium: 'en',
  Brazil: 'en',
  Canada: 'en',
  'Cayman Islands': 'en',
  China: 'en',
  'Costa Rica': 'en',
  Croatia: 'en',
  Cyprus: 'en',
  'Czech Republic': 'en',
  France: 'en',
  Germany: 'en',
  Greece: 'en',
  'Holy See (Vatican City State)': 'en',
  'Hong Kong': 'en',
  Iceland: 'en',
  India: 'en',
  Ireland: 'en',
  Israel: 'en',
  Italy: 'en',
  Japan: 'en',
  Liechtenstein: 'en',
  Luxembourg: 'en',
  Macao: 'en',
  Malaysia: 'en',
  Malta: 'en',
  Martinique: 'en',
  Mexico: 'en',
  Monaco: 'en',
  Netherlands: 'en',
  'New Zealand': 'en',
  Poland: 'en',
  Portugal: 'en',
  'Puerto Rico': 'en',
  'San Marino': 'en',
  Singapore: 'en',
  'South Africa': 'en',
  'South Korea': 'en',
  Spain: 'en',
  Switzerland: 'en',
  Turkey: 'en',
  'United Kingdom': 'en',
  'United States of America': 'en',
};

export const availableCountries = Object.keys(countryToMarketMapping);

// URL locale configuration (for routing only)
export const marketConfigMapping = {
  sv: { label: 'SV', countryCode: 'sv', currency: 'SEK' },
  fi: { label: 'FI', countryCode: 'fi', currency: 'EUR' },
  en: { label: 'EN', countryCode: 'gb', currency: 'USD' },
} as const;

export const supportedMarkets = Object.keys(marketConfigMapping) as Array<keyof typeof marketConfigMapping>;

// Currency mapping by country (independent of URL routing)
// This determines which currency to use for each country
export const countryToCurrencyMapping: Record<string, string> = {
  // SEK countries
  Sweden: 'SEK',

  // NOK countries
  Norway: 'NOK',

  // EUR countries (EU members)
  Denmark: 'EUR',
  Finland: 'EUR',
  Estonia: 'EUR',
  Latvia: 'EUR',
  Lithuania: 'EUR',
  'Åland Islands': 'EUR',
  Austria: 'EUR',
  Belgium: 'EUR',
  Croatia: 'EUR',
  Cyprus: 'EUR',
  'Czech Republic': 'EUR',
  France: 'EUR',
  Germany: 'EUR',
  Greece: 'EUR',
  'Holy See (Vatican City State)': 'EUR',
  Ireland: 'EUR',
  Italy: 'EUR',
  Luxembourg: 'EUR',
  Malta: 'EUR',
  Monaco: 'EUR',
  Netherlands: 'EUR',
  Poland: 'EUR',
  Portugal: 'EUR',
  'San Marino': 'EUR',
  Spain: 'EUR',

  // USD countries (non-EU)
  Australia: 'USD',
  Bahamas: 'USD',
  Barbados: 'USD',
  Brazil: 'USD',
  Canada: 'USD',
  'Cayman Islands': 'USD',
  China: 'USD',
  'Costa Rica': 'USD',
  'Hong Kong': 'USD',
  Iceland: 'USD',
  India: 'USD',
  Israel: 'USD',
  Japan: 'USD',
  Liechtenstein: 'USD',
  Macao: 'USD',
  Malaysia: 'USD',
  Martinique: 'USD',
  Mexico: 'USD',
  'New Zealand': 'USD',
  'Puerto Rico': 'USD',
  Singapore: 'USD',
  'South Africa': 'USD',
  'South Korea': 'USD',
  Switzerland: 'USD',
  Turkey: 'USD',
  'United Kingdom': 'USD',
  'United States of America': 'USD',
};

// Helper function to get currency for a country
export const getCurrencyForCountry = (country: string): string => {
  return countryToCurrencyMapping[country] || 'USD';
};

// Helper function to get the currency key for Findify pricing (e.g., 'price_sek', 'price_eur')
export const getCurrencyPriceKey = (country: string): string => {
  const currency = getCurrencyForCountry(country);
  return `price_${currency.toLowerCase()}`;
};

// Helper function to get the discount key for Findify pricing (e.g., 'discount_sek', 'discount_eur')
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
