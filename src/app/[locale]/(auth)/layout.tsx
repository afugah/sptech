import React, { type PropsWithChildren } from 'react';
import DefaultLayout from '@/src/components/layouts/Default';
import SettingsLayout from '@/src/components/layouts/Settings';
import { auth } from '@/src/lib/auth';
import { Unauthorized } from '@/src/templates/profile/unauthorized';
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

  const session = await auth();
  if (!session)
    return (
      <DefaultLayout config={config.story} locale={locale}>
        <Unauthorized />
      </DefaultLayout>
    );

  return (
    <SettingsLayout isCtaNewsletterShow={false} config={config.story} locale={locale}>
      {children}
    </SettingsLayout>
  );
};

export default layout;
