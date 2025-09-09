import { defineRouting } from 'next-intl/routing';

// Static configuration for URL routing
// Single language configuration - English only for all markets
const locales = [
  'en', // Global market at / (English language, currency varies by country)
] as const;

const defaultLocale = 'en' as const; // Default uses root path with no prefix

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Explicitly set to not add prefix for default locale
});
