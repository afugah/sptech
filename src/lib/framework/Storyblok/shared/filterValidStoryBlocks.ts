import { storyblokComponents } from '@/src/components/blocks';
import { type Grid, type Hero, type Usp } from '@/src/types/framework/storyblok-components';

/* #region Components validation */

// Add any type to handle all possible Storyblok components including linksGrid
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IStory = Hero | Grid | Usp | any;
const validComponents = Object.keys(storyblokComponents);

export const filterValidStoryBlocks = (blocks?: Array<IStory> | undefined): Array<IStory> =>
  blocks?.filter((block) => {
    if (validComponents.includes(block.component)) return true;

    console.error(`ERROR: Failed to render '${block.component}' storyblok component!`);
    return false;
  }) ?? [];
