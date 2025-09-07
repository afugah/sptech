/**
 * Search Page with Enhanced ISR Configuration
 *
 * Phase 3: Strategic ISR implementation for search results
 * with intelligent caching for popular search terms.
 */

import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import SearchPage from '@/src/templates/search/searchPage';
// ISR Configuration for Search Pages
export const revalidate = 900; // 15 minutes (ISR_REVALIDATION.SEARCH_PAGES)
export const dynamicParams = true;

interface ISearchProps {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ page?: string; q: string }>;
}

const Search: React.FC<ISearchProps> = async ({ params, searchParams }) => {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  return <SearchPage locale={locale} searchParams={resolvedSearchParams} />;
};

export default Search;

export async function generateMetadata({ params }: ISearchProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/search`;

  return {
    title: t('metadata.search'),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}
