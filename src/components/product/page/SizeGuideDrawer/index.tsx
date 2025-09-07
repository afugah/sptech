'use client';

import { StoryblokComponent } from '@storyblok/react';
import { Drawer } from '@/src/components/ui/Drawer';
import { useSizeGuideDrawer } from '@/src/context/sizeGuideDrawer';
import { type SizeGuide } from '@/src/types/framework/storyblok-components';

interface ISizeGuideDrawerProps {
  story: {
    content: SizeGuide;
  };
}

export const SizeGuideDrawer: React.FC<ISizeGuideDrawerProps> = ({ story }) => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useSizeGuideDrawer();
  return (
    <Drawer
      bodyClassName={'h-full'}
      className={'bg-seashell text-center'}
      open={isSizeGuideOpen}
      onClose={() => setIsSizeGuideOpen(false)}
      title={story.content.title}
    >
      <StoryblokComponent blok={story.content} key={story.content._uid} />
    </Drawer>
  );
};
