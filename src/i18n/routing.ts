import { defineRouting } from 'next-intl/routing';

// Static configuration for URL routing
// Sweden and Finland get URL prefixes, all other markets use root path
const locales = [
  'sv', // Swedish market at /sv/ (Swedish language, SEK)
  'fi', // Finnish market at /fi/ (Finnish language, EUR)
  'en', // Global/default market at / (English language, currency varies by country)
] as const;

const defaultLocale = 'en' as const; // Default uses root path with no prefix

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Explicitly set to not add prefix for default locale
});
