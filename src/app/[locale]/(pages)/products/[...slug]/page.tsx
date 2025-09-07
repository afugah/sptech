/**
 * Product Pages with Enhanced ISR Configuration
 *
 * Phase 3: Intelligent Static Generation with ISR Enhancement
 * Uses client-side data fetching with strategic static generation
 * for optimal performance and real-time updates.
 */

import { type Metadata } from 'next';
import React from 'react';
import ProductPageWrapper from '@/src/components/product/ProductPageWrapper';
import { StaticGenerationService } from '@/src/lib/isr';

interface IProductPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ISR Configuration for Product Pages
export const revalidate = 300; // 5 minutes (ISR_REVALIDATION.PRODUCT_PAGES)
export const dynamicParams = true;
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

const ProductPageComponent: React.FC<IProductPageProps> = async ({ params }) => {
  const { locale, slug } = await params;
  const joinedSlug = slug.join('/');

  // Return immediately without any data fetching
  // ALL data will be fetched client-side
  return <ProductPageWrapper locale={locale} slug={joinedSlug} />;
};

export default ProductPageComponent;

// Enhanced static generation for top products
export async function generateStaticParams() {
  const staticGenService = new StaticGenerationService();

  try {
    const params = await staticGenService.generateEnhancedStaticParams();

    // Filter for product pages only
    const productParams = params.filter(
      (param) =>
        param.slug.length >= 2 && // Products typically have at least 2 path segments
        !param.slug.includes('categories') &&
        !param.slug.includes('search'),
    );

    console.warn(`🔥 Generated ${productParams.length} product static params`);
    return productParams;
  } catch (error) {
    console.error('❌ Error generating product static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: IProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const joinedSlug = `products/${slug.join('/')}`;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/${joinedSlug}`;

  // Return basic metadata without fetching product data
  // The actual product data will be loaded client-side
  return {
    title: 'Product',
    description: 'View product details and information',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      siteName: process.env.NEXT_PUBLIC_STORE_NAME || '',
      title: 'Product',
      description: 'View product details and information',
      url: canonicalUrl,
      type: 'website',
    },
  };
}
