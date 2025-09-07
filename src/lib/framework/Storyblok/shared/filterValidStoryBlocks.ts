import { storyblokComponents } from '@/src/components/blocks';
import { type Grid, type Hero, type Usp } from '@/src/types/framework/storyblok-components';

/* #region Components validation */

type IStory = Hero | Grid | Usp;
const validComponents = Object.keys(storyblokComponents);

export const filterValidStoryBlocks = (blocks?: Array<IStory> | undefined): Array<IStory> =>
  blocks?.filter((block) => {
    if (validComponents.includes(block.component)) return true;

    console.error(`ERROR: Failed to render '${block.component}' storyblok component!`);
    return false;
  }) ?? [];
