'use client';

import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import { type CmsPage, type MenuLink } from '@/src/types/framework/storyblok-components';
import { type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
type Props = {
  story: {
    name: string;
    content: CmsPage;
  };
};

const CmsPageComponent = ({ story }: Props) => {
  const { backgroundColor, blocks } = story.content;
  const validBlocks = Array.isArray(blocks) ? blocks : [];

  return (
    <div
      className={'mx-auto mb-16 min-h-screen'}
      style={
        (backgroundColor as StoryblokColorPicker)?.value
          ? { backgroundColor: (backgroundColor as StoryblokColorPicker).value as string }
          : undefined
      }
    >
      <PageHeader
        header_menu={story.content.header_menu as MenuLink[]}
        _uid={story.content._uid}
        component={'config'}
        hasHeaderFixed={false}
      />

      {validBlocks?.map((blok) => <StoryblokComponent blok={blok} key={blok._uid} />)}
    </div>
  );
};

export default CmsPageComponent;
