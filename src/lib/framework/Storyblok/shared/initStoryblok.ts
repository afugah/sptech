import { apiPlugin, storyblokInit } from '@storyblok/react';
import { storyblokComponents } from '@/src/components/blocks';

export const initStoryblok = (): void => {
  try {
    const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
    // Initialization logging removed - production ready

    storyblokInit({
      accessToken: token,
      use: [apiPlugin],
      components: storyblokComponents,
    });
  } catch (error) {
    console.error('Failed to initialize Storyblok:', error);
  }
};
