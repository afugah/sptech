import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { fetchStoryblokStory, type StoryblokStoryData } from './fetchStoryBlokStory';

export async function fetchSizeGuideStoryByCategory(
  locale: string,
  category: string,
): Promise<StoryblokStoryData<CmsPage>> {
  // Handle empty category
  if (!category) {
    return {
      story: undefined,
      sbConfig: undefined,
      isPreview: false,
    };
  }

  // Normalize category to lowercase to match Storyblok slugs
  const normalizedCategory = category.toLowerCase();

  // Try with the normalized category
  const slug = `content/size-guide/${normalizedCategory}`;

  // Pass the locale to get the correct language version (en, fi, or default Swedish)
  const result = await fetchStoryblokStory<CmsPage>(slug, locale);

  return result;
}

export async function fetchDiamondInformationStory(locale: string): Promise<StoryblokStoryData<CmsPage>> {
  // Pass the locale to get the correct language version (en, fi, or default Swedish)
  return fetchStoryblokStory<CmsPage>('content/diamond-information', locale);
}
