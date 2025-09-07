import { apiPlugin, storyblokInit } from '@storyblok/react';
import { storyblokComponents } from '@/src/components/blocks';

export const initStoryblok = (): void => {
  try {
    storyblokInit({
      accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
      use: [apiPlugin],
      components: storyblokComponents,
    });
  } catch (error) {
    console.error('Failed to initialize Storyblok:', error);
  }
};
