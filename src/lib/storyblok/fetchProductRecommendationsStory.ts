import { type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import { type ProductRecommendations } from '@/src/types/framework/storyblok-components';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

export type ProductRecommendationsStoryData = {
  story?: StoryblokStory<ProductRecommendations>;
  sbConfig?: ISbStoriesParams;
  isPreview?: boolean;
};
type StoryblokContent = Record<string, unknown>;

type StoryblokStory<T extends StoryblokContent = StoryblokContent> = {
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

export async function fetchProductRecommendationsStory(locale: string): Promise<ProductRecommendationsStoryData> {
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);
    const storyblokApi = getStoryblokInstance();
    const version = isPreviewEnvironment() ? 'draft' : 'published';
    const sbConfig: ISbStoriesParams = { version, language };
    const { data } = await storyblokApi.get(`cdn/stories/config/product-recommendations`, sbConfig);

    // Cast the story to the correct type
    return {
      story: data?.story as StoryblokStory<ProductRecommendations>,
      sbConfig,
      isPreview: isPreviewEnvironment(),
    };
  } catch (error) {
    console.error('Error fetching size guide story from Storyblok:', error);
    return { story: undefined, sbConfig: undefined, isPreview: isPreviewEnvironment() };
  }
}
