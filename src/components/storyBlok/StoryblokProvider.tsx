'use client';

import { type PropsWithChildren } from 'react';
import { initStoryblok } from '@/src/lib/framework/Storyblok/shared/initStoryblok';

initStoryblok();

const StoryblokProvider = ({ children }: PropsWithChildren) => children;

export default StoryblokProvider;
