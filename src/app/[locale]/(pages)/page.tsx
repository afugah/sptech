/**
 * Homepage with Enhanced ISR Configuration
 *
 * Phase 3: Strategic ISR implementation for homepage content
 * with intelligent caching and static generation.
 */

import { getStoryblokApi, type ISbStoriesParams } from '@storyblok/react';
import React from 'react';
import PageHeader from '@/src/components/header/PageHeader';
import PreviewComponent from '@/src/components/storyBlok/PreviewComponent';
import ProductionComponent from '@/src/components/storyBlok/ProductionComponent';
import { di } from '@/src/lib/di';
import { initStoryblok } from '@/src/lib/framework/Storyblok/shared/initStoryblok';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

// ISR Configuration for Homepage
export const revalidate = 21600; // 6 hours (ISR_REVALIDATION.HOMEPAGE)
export const dynamicParams = true;

initStoryblok();

interface IProps {
  params: Promise<{
    locale: string;
  }>;
}

const Home: React.FC<IProps> = async ({ params }) => {
  const { locale } = await params;
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);

    const storyblokApi = getStoryblokApi();
    // Force draft version in development for immediate updates
    const version = process.env.NODE_ENV === 'development' ? 'draft' : isPreviewEnvironment() ? 'draft' : 'published';

    const sbConfig: ISbStoriesParams = { version, language, resolve_links: 'url' };
    try {
      const { data } = await storyblokApi.get(`cdn/stories/home`, sbConfig);
      if (!data || !data.story) {
        console.warn('No Storyblok data found for home story');
        return (
          <>
            <PageHeader header_menu={[]} _uid={'fallback'} component={'config'} hasHeaderFixed={true} />
            <div className={'p-8'}>
              <h1>Welcome</h1>
              <p>Storyblok content not available</p>
            </div>
          </>
        );
      }

      return isPreviewEnvironment() ? (
        <>
          <PageHeader
            header_menu={data.story.content.header_menu || []}
            _uid={data.story.content._uid}
            component={'config'}
            hasHeaderFixed={true}
          />
          <PreviewComponent sbConfig={sbConfig} slug={data.story.slug} />
        </>
      ) : (
        <>
          <PageHeader
            header_menu={data.story.content.header_menu || []}
            _uid={data.story.content._uid}
            component={'config'}
            hasHeaderFixed={true}
          />
          <ProductionComponent story={data.story} />
        </>
      );
    } catch (storyblokError) {
      console.error(
        'Error fetching story from Storyblok:',
        storyblokError instanceof Error ? storyblokError.message : storyblokError,
      );
      // Return a fallback UI instead of null
      return (
        <>
          <PageHeader header_menu={[]} _uid={'error-fallback'} component={'config'} hasHeaderFixed={true} />
          <div className={'p-8'}>
            <h1>Welcome</h1>
            <p>Unable to load content. Navigation is still available.</p>
          </div>
        </>
      );
    }
  } catch (error) {
    console.error('Error in Home component:', error);
    return null;
  }
};

export default Home;
