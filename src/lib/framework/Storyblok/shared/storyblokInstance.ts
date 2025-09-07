import StoryblokClient from 'storyblok-js-client';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

// Create a singleton instance of the Storyblok client
let storyblokClient: StoryblokClient | null = null;

// Get or create a Storyblok client instance
export const getStoryblokInstance = (): StoryblokClient => {
  if (storyblokClient) {
    return storyblokClient;
  }

  const isPreview = isPreviewEnvironment();

  // Create a new instance if one doesn't exist
  storyblokClient = new StoryblokClient({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || '',
    cache: {
      clear: 'auto',
      type: isPreview ? 'none' : 'memory',
    },
  });

  return storyblokClient;
};

// Keep this function for backward compatibility
export const initializeStoryblok = (): void => {
  // Just ensure the client is created
  getStoryblokInstance();
};
