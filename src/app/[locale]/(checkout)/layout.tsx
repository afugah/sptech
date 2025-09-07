export const dynamic = 'force-dynamic';

import React, { type PropsWithChildren } from 'react';
import CheckoutLayout from '@/src/components/layouts/Checkout';
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
    <CheckoutLayout isCtaNewsletterShow={false} config={config.story}>
      {children}
    </CheckoutLayout>
  );
};

export default layout;
