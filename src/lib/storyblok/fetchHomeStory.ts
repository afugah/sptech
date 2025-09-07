import { type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

export async function fetchHomeStory(locale: string) {
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);
    const storyblokApi = getStoryblokInstance();
    const version = isPreviewEnvironment() ? 'draft' : 'published';
    const sbConfig: ISbStoriesParams = { version, language, resolve_links: 'url' };
    const { data } = await storyblokApi.get(`cdn/stories/home`, sbConfig);
    return {
      data,
      sbConfig,
      isPreview: isPreviewEnvironment(),
    };
  } catch (error) {
    console.error('Error fetching story from Storyblok:', error);
    return { data: null, sbConfig: undefined, isPreview: isPreviewEnvironment() };
  }
}
