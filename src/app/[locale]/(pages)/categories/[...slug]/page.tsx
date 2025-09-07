/**
 * Category Pages with Enhanced ISR Configuration
 *
 * Phase 3: Intelligent Static Generation with ISR Enhancement
 * Dedicated category page component with optimized ISR settings
 * for product catalog updates and strategic static generation.
 */

import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type SearchParams } from 'nuqs/server';
import React from 'react';
import { StaticGenerationService } from '@/src/lib/isr';
import { fetchPageDataSafe } from '@/src/lib/storyblok/fetchPageDataSafe';
import CategoryPageComponent from '@/src/templates/category/categoryPage';
import { type CategoryPage } from '@/src/types/framework/storyblok-components';

interface ICategoryPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<{ page?: string } & SearchParams>;
}

type StoryblokStory<T> = {
  name: string;
  content: T;
  uuid?: string;
  id?: number;
  slug?: string;
  full_slug?: string;
  default_full_slug?: string;
  created_at?: string;
  published_at?: string;
  first_published_at?: string;
  lang?: string;
  parent_id?: number;
};

// Enhanced ISR Configuration for Category Pages
export const revalidate = 1800; // 30 minutes (ISR_REVALIDATION.CATEGORY_PAGES)
export const dynamicParams = true;

const CategoryPageRoute: React.FC<ICategoryPageProps> = async ({ params, searchParams }) => {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const joinedSlug = `categories/${slug.join('/')}`;

  const { story } = await fetchPageDataSafe(locale, joinedSlug);

  if (!story || story.content?.component !== 'categoryPage') {
    notFound();
  }

  return (
    <CategoryPageComponent
      story={story as StoryblokStory<CategoryPage>}
      slug={joinedSlug}
      locale={locale}
      searchParams={resolvedSearchParams}
    />
  );
};

export default CategoryPageRoute;

// Enhanced static generation for category pages
export async function generateStaticParams() {
  const staticGenService = new StaticGenerationService();

  try {
    const params = await staticGenService.generateEnhancedStaticParams();

    // Filter for category pages only
    const categoryParams = params.filter(
      (param) =>
        param.slug.includes('categories') ||
        param.slug.some((segment) => ['jewelry', 'accessories', 'sale', 'new-arrivals'].includes(segment)),
    );

    // Add predefined main categories as fallback
    const mainCategories = [
      { locale: 'sv', slug: ['jewelry'] },
      { locale: 'sv', slug: ['jewelry', 'rings'] },
      { locale: 'sv', slug: ['jewelry', 'necklaces'] },
      { locale: 'sv', slug: ['jewelry', 'earrings'] },
      { locale: 'sv', slug: ['jewelry', 'bracelets'] },
      { locale: 'sv', slug: ['accessories'] },
      { locale: 'sv', slug: ['accessories', 'watches'] },
      { locale: 'sv', slug: ['accessories', 'bags'] },
      { locale: 'sv', slug: ['sale'] },
      { locale: 'sv', slug: ['new-arrivals'] },
    ];

    // Combine generated params with main categories
    const allParams = [...categoryParams, ...mainCategories];

    console.warn(`🔥 Generated ${allParams.length} category static params`);
    return allParams;
  } catch (error) {
    console.error('❌ Error generating category static params:', error);

    // Fallback to main categories
    return [
      { locale: 'sv', slug: ['jewelry'] },
      { locale: 'sv', slug: ['jewelry', 'rings'] },
      { locale: 'sv', slug: ['jewelry', 'necklaces'] },
      { locale: 'sv', slug: ['jewelry', 'earrings'] },
      { locale: 'sv', slug: ['jewelry', 'bracelets'] },
      { locale: 'sv', slug: ['accessories'] },
      { locale: 'sv', slug: ['accessories', 'watches'] },
      { locale: 'sv', slug: ['accessories', 'bags'] },
      { locale: 'sv', slug: ['sale'] },
      { locale: 'sv', slug: ['new-arrivals'] },
    ];
  }
}

export async function generateMetadata({ params, searchParams }: ICategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const joinedSlug = `categories/${slug.join('/')}`;
  const resolvedSearchParams = await searchParams;

  let canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/${joinedSlug}`;

  if (resolvedSearchParams?.page && resolvedSearchParams.page !== '1') {
    canonicalUrl += `?page=${resolvedSearchParams.page}`;
  }

  const { story } = await fetchPageDataSafe(locale, joinedSlug);

  if (!story) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  const content = story.content as Partial<CategoryPage> & { title?: string };
  const seo = content.seo as Record<string, unknown> | undefined;
  const ogTitle: string =
    (typeof content.collectionMetaTitle === 'string' ? content.collectionMetaTitle : undefined) ||
    (typeof seo?.title === 'string' ? seo.title : undefined) ||
    (typeof content.title === 'string' ? content.title : undefined) ||
    'Category';
  const ogDescription: string | undefined =
    (typeof content.collectionMetaDescription === 'string' ? content.collectionMetaDescription : undefined) ||
    (typeof seo?.description === 'string' ? seo.description : undefined) ||
    (content.CollectionDescription && typeof content.CollectionDescription === 'string'
      ? content.CollectionDescription.substring(0, 200)
      : undefined);

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      siteName: process.env.NEXT_PUBLIC_BASE_URL || '',
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      type: 'website',
      images: typeof seo?.image === 'string' ? seo.image : undefined,
    },
  };
}
