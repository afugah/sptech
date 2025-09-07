import { getStoryblokApi, type ISbStoriesParams } from '@storyblok/react';
import React from 'react';
import { di } from '@/src/lib/di';
import ProfilePage from '@/src/templates/profile/profilePage';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

export const dynamic = 'force-dynamic';

interface IProfileProps {
  params: Promise<{ locale: string }>;
}

const Profile: React.FC<IProfileProps> = async ({ params }) => {
  const { locale } = await params;
  try {
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);

    const storyblokApi = getStoryblokApi();
    const version = isPreviewEnvironment() ? 'draft' : 'published';
    const sbConfig: ISbStoriesParams = { version, language, resolve_links: 'url' };

    const { data } = await storyblokApi.get(`cdn/stories/content/profile`, sbConfig);
    return <ProfilePage story={data?.story ?? null} />;
  } catch (error) {
    console.error('Error fetching story from Storyblok:', error);
    return <ProfilePage story={null} />;
  }
};

export default Profile;
