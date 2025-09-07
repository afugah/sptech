import { type IStoryblok } from '@/src/types/framework/storyblok';

export const isStorybookLinks = (value: unknown): value is IStoryblok.Links =>
  !!value && typeof value === 'object' && 'links' in value;
