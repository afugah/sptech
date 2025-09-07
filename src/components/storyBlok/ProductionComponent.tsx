import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import { filterValidStoryBlocks } from '@/src/lib/framework/Storyblok/shared/filterValidStoryBlocks';
import {
  type Banner,
  type BannerGrid,
  type CollectionPage,
  type Grid,
  type Hero,
  type Usp,
} from '@/src/types/framework/storyblok-components';

interface IProductionComponentProps {
  story: {
    name: string;
    content: Hero | Grid | Usp | BannerGrid | Banner | CollectionPage;
  };
}

const ProductionComponent: React.FC<IProductionComponentProps> = ({ story }) => {
  // Type guard to safely access blocks property that exists on some content types
  const contentWithBlocks = story?.content as unknown as { blocks?: Array<Hero | Grid | Usp> };
  const blocks: Array<Hero | Grid | Usp> = filterValidStoryBlocks(contentWithBlocks?.blocks);

  return <div>{blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}</div>;
};

export default ProductionComponent;
