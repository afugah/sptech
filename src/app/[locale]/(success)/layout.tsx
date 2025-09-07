export const dynamic = 'force-dynamic';

import React, { type PropsWithChildren } from 'react';
import DefaultLayout from '@/src/components/layouts/Default';
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
    </DefaultLayout>
  );
};

export default layout;
