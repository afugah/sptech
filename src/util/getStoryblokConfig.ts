import { getStoryblokApi, type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { initStoryblok } from '@/src/lib/framework/Storyblok/shared/initStoryblok';

initStoryblok();

export const getStoryblokConfig = async (locale: string) => {
  const config = di.resolve(di.Tokens.Configuration);
  const _language = config.getLanguage(locale) || locale || 'en'; // Default to locale or 'en' if undefined

  const storyblokApi = getStoryblokApi();

  const sbParams: ISbStoriesParams = {
    version: process.env.NODE_ENV === 'development' ? 'draft' : 'published',
    language: 'default', // Always use 'default' language for config as it's language-agnostic
  };

  // Config logging removed - production ready

  try {
    const { data } = await storyblokApi.get('cdn/stories/config/config-general', sbParams);
    return data;
  } catch (error) {
    console.error('[getStoryblokConfig] Error fetching config:', error);
    throw error;
  }
};
