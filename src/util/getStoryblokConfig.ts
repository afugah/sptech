import { getStoryblokApi, type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { initStoryblok } from '@/src/lib/framework/Storyblok/shared/initStoryblok';

initStoryblok();

export const getStoryblokConfig = async (locale: string) => {
  const config = di.resolve(di.Tokens.Configuration);
  const language = config.getLanguage(locale);

  const storyblokApi = getStoryblokApi();

  const sbParams: ISbStoriesParams = {
    version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
    language,
  };

  const { data } = await storyblokApi.get('cdn/stories/config/config-general', sbParams);

  return data;
};
