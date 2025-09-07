export const getMarketCode = (locale: string): string => locale.split('-')[0];

export const getLanguage = (locale: string): string | undefined => locale.split('-')[1];

const LOCALE_MAPPING: Record<string, string> = {
  sv: 'sv-SE',
  no: 'nb-NO',
  da: 'da-DK',
  fi: 'fi-FI',
  en: 'en-GB',
};

export const getLocaleCode = (locale: string): string => {
  return LOCALE_MAPPING[locale] || locale;
};
