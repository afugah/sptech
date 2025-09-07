import { StoryblokComponent } from '@storyblok/react';
import { HorizontalScrollGrid } from '@/src/components/ui/HorizontalScrollGrid';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type HorizontalScrollGrid as HorizontalScrollGridType } from '@/src/types/framework/storyblok-components';
import { type StoryblokContent } from '@/src/types/framework/storyblok-helpers';

const shoplabProducts: IStoryblok.FC<HorizontalScrollGridType> = ({ blok }) => (
  <HorizontalScrollGrid
    title={blok.title}
    scrollPercentage={blok.scrollPercentage ? +blok.scrollPercentage : undefined}
    height={blok.height ? +blok.height : undefined}
    elementWidth={blok.elementWidth ? +blok.elementWidth : undefined}
  >
    {blok.blocks?.map((block: StoryblokContent) => <StoryblokComponent blok={block} key={block._uid as string} />)}
  </HorizontalScrollGrid>
);

export default shoplabProducts;
