import '@/src/styles/app.css';
import { type Viewport } from 'next';
import { type Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import React, { type PropsWithChildren } from 'react';
// import { routing } from '@/src/i18n/navigation';
import { di } from '@/src/lib/di';
import { initStoryblok } from '@/src/lib/framework/Storyblok/shared/initStoryblok';
// import StyledComponentsRegistry from '@/src/lib/registry';
import { getStoryblokConfig } from '@/src/util/getStoryblokConfig';
import { getLocaleCode } from '@/src/util/locale';
import { Providers } from '../providers';
import LangSetter from './LangSetter';

initStoryblok();

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'only light',
};

interface IProps extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

const layout: React.FC<IProps> = async ({ children, params }) => {
  const { locale } = await params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  const lang = getLangCode(locale);

  return (
    <>
      {/* <StyledComponentsRegistry> */}
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <LangSetter lang={lang} />
          {children}
        </Providers>
      </NextIntlClientProvider>
      {/* </StyledComponentsRegistry> */}
    </>
  );
};

export default layout;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const config = await getStoryblokConfig(locale);
  const url = process.env.NEXT_PUBLIC_BASE_URL || '';
  const canonicalUrl = `${url}/${locale}`;
  const siteTitle = config?.story.content.seo?.title || process.env.NEXT_PUBLIC_STORE_NAME;
  const siteDescription = config?.story.content.seo?.description;
  const ogTitle = config?.story?.content?.og_title || siteTitle;
  const ogDescription = config?.story?.content?.og_description || siteDescription;
  const twitterTitle = config?.story?.content?.twitter_title || siteTitle;
  const twitterDescription = config?.story?.content?.twitter_description || siteDescription;

  if (!config) {
    return {};
  }

  return {
    title: {
      template: `%s | ${siteTitle || process.env.NEXT_PUBLIC_STORE_NAME}`,
      default: siteTitle,
    },
    description: siteDescription,
    openGraph: {
      type: 'website',
      siteName: ogTitle,
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      locale: getLocaleCode(locale),
      images: [{ url: config?.story?.content?.og_image, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      images: [{ url: config?.story?.content?.twitter_image, alt: twitterTitle }],
    },
    robots: {
      index: true,
      follow: true,
    },
    manifest: '/site.webmanifest',
    alternates: {
      canonical: canonicalUrl,
      // languages: {
      //   'sv-SE': `${url}/se`,
      //   'nb-NO': `${url}/no`,
      //   'fi-FI': `${url}/fi`,
      // },
    },
  };
}

const getLangCode = (locale: string) => {
  const config = di.resolve(di.Tokens.Configuration);
  return config.getLanguage(locale) || 'en';
};

// Commented out to prevent static generation of dynamic pages
// export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));
