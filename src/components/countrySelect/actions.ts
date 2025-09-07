'use server';

import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { di } from '@/src/lib/di';

export const getMarkets = async (): Promise<IConfiguration['Search']['Markets']> => {
  const config = di.resolve(di.Tokens.Configuration);
  return config.Search.Markets;
};

export const getLanguages = async (): Promise<IConfiguration['Languages']> => {
  const config = di.resolve(di.Tokens.Configuration);
  return config.Languages;
};

export const getLanguageByLocale = async (locale: string): Promise<string | undefined> => {
  const config = di.resolve(di.Tokens.Configuration);
  return config.getLanguage(locale);
};
