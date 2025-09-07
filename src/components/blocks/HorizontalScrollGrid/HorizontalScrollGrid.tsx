import { StoryblokComponent } from '@storyblok/react';
import { HorizontalScrollGrid as HorizontalScrollGridComponent } from '@/src/components/ui/HorizontalScrollGrid';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type HorizontalScrollGrid } from '@/src/types/framework/storyblok-components';

export const HorizontalScrollGridBlok: IStoryblok.FC<HorizontalScrollGrid> = ({ blok }) => (
  <HorizontalScrollGridComponent
    title={blok.title}
    scrollPercentage={blok.scrollPercentage ? +blok.scrollPercentage : undefined}
    height={blok.height ? +blok.height : undefined}
    elementWidth={blok.elementWidth ? +blok.elementWidth : undefined}
  >
    {blok.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
  </HorizontalScrollGridComponent>
);
