export type LocalizedString = string | Record<string, string>;

export const getLocalizedString = (text: LocalizedString, locale: string): string => {
  if (typeof text === 'string') return text;
  return text[locale] || text.en || Object.values(text)[0] || '';
};
