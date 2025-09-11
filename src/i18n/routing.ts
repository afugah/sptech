import { defineRouting } from 'next-intl/routing';

// Market-specific URL routing with English language for all markets
// Each market gets its own URL prefix (e.g., /se, /no, /dk)
const locales = [
  'se', // Sweden - SEK
  'no', // Norway - NOK
  'dk', // Denmark - DKK
  'fi', // Finland - EUR
  'de', // Germany - EUR
  'at', // Austria - EUR
  'be', // Belgium - EUR
  'bg', // Bulgaria - EUR
  'cz', // Czech Republic - EUR
  'ee', // Estonia - EUR
  'es', // Spain - EUR
  'fr', // France - EUR
  'hr', // Croatia - EUR
  'hu', // Hungary - EUR
  'it', // Italy - EUR
  'lt', // Lithuania - EUR
  'lu', // Luxembourg - EUR
  'lv', // Latvia - EUR
  'nl', // Netherlands - EUR
  'ph', // Philippines - EUR
  'pl', // Poland - EUR
  'pt', // Portugal - EUR
  'ro', // Romania - EUR
  'si', // Slovenia - EUR
  'sk', // Slovakia - EUR
  'gb', // United Kingdom - GBP
  'ch', // Switzerland - EUR
] as const;

const defaultLocale = 'se' as const; // Default to Sweden market

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show market prefix in URL
});
