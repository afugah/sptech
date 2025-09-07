// Allow static generation for product pages and other static content
export const dynamic = 'auto'; // Let Next.js decide based on page requirements
export const revalidate = 3600; // Cache for 1 hour

import React, { type PropsWithChildren } from 'react';
import DefaultLayout from '@/src/components/layouts/Default';
// import { ZendeskChat } from '@/src/components/ZendeskChat';
import { getStoryblokConfig } from '@/src/util/getStoryblokConfig';

type IProps = PropsWithChildren<{
  params: Promise<{
    locale: string;
  }>;
}>;

const layout: React.FC<IProps> = async ({ params, children }) => {
  const { locale } = await params;
  const config = await getStoryblokConfig(locale);
  if (!config) return null;

  return (
    <DefaultLayout config={config.story} locale={locale}>
      {children}
      {/* <ZendeskChat /> */}
    </DefaultLayout>
  );
};

export default layout;
