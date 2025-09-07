import { getRequestConfig } from 'next-intl/server';
import { di } from '@/src/lib/di';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const config = di.resolve(di.Tokens.Configuration);
  const language = config.getLanguage(locale);

  return {
    locale,
    messages: (await import(`../../translations/${language}.json`)).default,
  };
});
