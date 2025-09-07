'use client';

import { type ISbStoriesParams, StoryblokComponent, useStoryblok } from '@storyblok/react';
import React from 'react';
import { filterValidStoryBlocks } from '@/src/lib/framework/Storyblok/shared/filterValidStoryBlocks';

interface IPreviewComponentProps {
  sbConfig?: ISbStoriesParams;
  slug: string;
}

const PreviewComponent: React.FC<IPreviewComponentProps> = ({ sbConfig, slug }) => {
  const story = useStoryblok(slug, { ...sbConfig, version: 'draft' });
  const blocks = filterValidStoryBlocks(story?.content?.blocks);

  return <div>{blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}</div>;
};

export default PreviewComponent;
