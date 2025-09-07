import { type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';
import { fetchStoryblokStoryCached } from './cachedStoryblokFetcher';

type StoryblokContent = Record<string, unknown>;

export type StoryblokStory<T extends StoryblokContent = StoryblokContent> = {
  name: string;
  content: T;
  uuid?: string;
  id?: number;
  slug?: string;
  full_slug?: string;
  default_full_slug?: string;
  created_at?: string;
  published_at?: string;
  first_published_at?: string;
  lang?: string;
  parent_id?: number;
};

export type StoryblokStoryData<T extends StoryblokContent = StoryblokContent> = {
  story?: StoryblokStory<T>;
  sbConfig?: ISbStoriesParams;
  isPreview?: boolean;
};

export async function fetchStoryblokStory<T extends StoryblokContent>(
  slug: string,
  locale: string,
  options: {
    version?: 'draft' | 'published';
    resolveRelations?: string[];
    otherParams?: Record<string, string>;
    useCache?: boolean; // New option to control caching
  } = {},
): Promise<StoryblokStoryData<T>> {
  // Use cached version by default, with option to bypass
  if (options.useCache !== false) {
    return fetchStoryblokStoryCached<T>(slug, locale, options);
  }

  // Fallback to direct API call (original implementation)
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);
    const storyblokApi = getStoryblokInstance();

    const version = options.version || (isPreviewEnvironment() ? 'draft' : 'published');

    // Build sbConfig - only include language if it's defined and not empty
    const sbConfig: ISbStoriesParams = {
      version,
      ...options.otherParams,
      ...(options.resolveRelations ? { resolve_relations: options.resolveRelations } : {}),
    };

    // Only add language if it's actually defined and not empty
    if (language && language !== '') {
      sbConfig.language = language;
    }

    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbConfig);

    return {
      story: data?.story as StoryblokStory<T>,
      sbConfig,
      isPreview: isPreviewEnvironment(),
    };
  } catch (error) {
    // Check if it's a 404 (story not found) or "Unknown" error (also indicates not found)
    const is404 =
      error instanceof Error &&
      (error.message.includes('Not Found') || error.message.includes('404') || error.message === 'Unknown');

    // Only log non-404 errors
    if (!is404) {
      console.error(`Error fetching Storyblok story (${slug}):`, error);

      // Log more details for debugging
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
        console.error(`Stack trace: ${error.stack}`);
      }
    }

    return {
      story: undefined,
      sbConfig: undefined,
      isPreview: isPreviewEnvironment(),
    };
  }
}
