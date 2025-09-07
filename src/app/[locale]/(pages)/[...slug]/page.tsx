import { type Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { type SearchParams } from 'nuqs/server';
import React from 'react';
import { ProductJsonLd } from '@/src/components/product/page/ProductJsonLd';
import { getISRConfigForPage } from '@/src/lib/isr/isr-config';
import { isVercelBuild } from '@/src/lib/isVercelBuild';
import { fetchDiamondInformationStory, fetchSizeGuideStoryByCategory } from '@/src/lib/storyblok/fetchers';
import { fetchPageDataSafe } from '@/src/lib/storyblok/fetchPageDataSafe';
import CategoryPageComponent from '@/src/templates/category/categoryPage';
import CollectionPageTemplate from '@/src/templates/category/collectionPage';
import CmsPageComponent from '@/src/templates/cms/cmsPage';
import ProductPage from '@/src/templates/product/productPage';
import {
  type CategoryPage,
  type CmsPage,
  type CollectionPage,
  type GiftsPage,
  type Page,
} from '@/src/types/framework/storyblok-components';

interface IPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
  searchParams: Promise<{ page?: string } & SearchParams>;
}

type StoryblokContent = CmsPage | Page | CollectionPage | CategoryPage | GiftsPage;

type StoryblokStory<T extends StoryblokContent = StoryblokContent> = {
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

type CmsStoryblokStory = StoryblokStory<CmsPage>;

type CollectionStoryblokStory = StoryblokStory<CollectionPage> & {
  translated_slugs: Array<{ lang: string; path: string; name: string }>;
};

const PageRoute: React.FC<IPageProps> = async ({ params, searchParams }) => {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const joinedSlug = slug.join('/');

  // Get ISR configuration for this page (for future dynamic use)
  const _isrConfig = getISRConfigForPage(slug);

  // const { story: productRecommendationsStory } = await fetchProductRecommendationsStory(locale);
  const { product, story, redirectUrl } = await fetchPageDataSafe(locale, joinedSlug);

  // Check if this is a product page by looking at the slug pattern
  const isProductPage = joinedSlug.startsWith('p/');

  // Handle product pages with server-side data loading
  if (isProductPage) {
    try {
      // Import ProductService dynamically for server-side use
      const { di } = await import('@/src/lib/di');
      const { ProductService } = await import('@/src/lib/framework/Product/services/ProductService');
      const productService = di.resolve(ProductService);

      // Get product data server-side
      const product = await productService.getItemBySlug(locale, joinedSlug);

      if (!product) {
        notFound();
      }

      // Debug for ring product issue (uncomment if needed)
      // if (joinedSlug.includes('love-knot-stars-ring-gold')) {
      //   console.log('Ring product server debug:', {
      //     joinedSlug,
      //     productSku: product.sku,
      //     variantsLength: product.variants.length,
      //     variants: product.variants.map((v) => ({
      //       sku: v.sku,
      //       size: v.size,
      //       stockQuantity: v.stock?.quantity,
      //       hasStock: !!v.stock?.quantity,
      //     })),
      //   });
      // }

      // Fetch additional stories
      const { story: sizeGuideStory } = await fetchSizeGuideStoryByCategory(locale, product.sanity_category ?? '');
      const { story: diamondInformationStory } = await fetchDiamondInformationStory(locale);

      // Fetch elastic data for MTO product support
      let elasticData = undefined;
      try {
        // Fetch elastic data from the API endpoint
        const elasticResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/elastic/${product.id}`, {
          cache: 'no-store',
        });
        if (elasticResponse.ok) {
          elasticData = await elasticResponse.json();
        }
      } catch {
        // Silently handle error - elastic data is optional
      }

      return (
        <ProductPage
          diamondInformationStory={diamondInformationStory}
          sizeGuideStory={sizeGuideStory}
          product={product}
          language={locale}
          elasticData={elasticData}
        />
      );
    } catch (error) {
      console.error('[Page] Error loading product:', error);
      notFound();
    }
  }

  if (product) {
    if (redirectUrl) {
      permanentRedirect(`/${locale}${redirectUrl}`);
    }
    const { story: sizeGuideStory } = await fetchSizeGuideStoryByCategory(locale, product.sanity_category ?? '');
    const { story: diamondInformationStory } = await fetchDiamondInformationStory(locale);

    // Fetch elastic data for MTO product support
    let elasticData = undefined;
    try {
      // Fetch elastic data from the API endpoint
      const elasticResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/elastic/${product.id}`, {
        cache: 'no-store',
      });
      if (elasticResponse.ok) {
        elasticData = await elasticResponse.json();
      }
    } catch {
      // Silently handle error - elastic data is optional
    }

    const { title, display_name, description, variants = [], thumbnail } = product;
    const hasStock = Array.isArray(variants) ? variants.some((variant) => variant?.stock?.isAvailable) : false;
    const productTitle = `${title ?? ''} - ${display_name ?? ''}`.trim();
    const variantWithPrice = variants.find(
      (variant) => variant.price?.salePriceAmount || variant.price?.basePriceAmount,
    );
    const productPrice = variantWithPrice?.price?.salePriceAmount ?? variantWithPrice?.price?.basePriceAmount ?? 0;

    const productDescription = description
      ? description
          .replace(/<(?:.|\n)*?>/gm, '')
          .replace(/\n/g, '')
          .substring(0, 200)
      : undefined;
    const currency = locale === 'sv' ? 'SEK' : locale === 'no' ? 'NOK' : locale === 'fi' ? 'EUR' : 'EUR';
    return (
      <>
        <ProductJsonLd
          title={productTitle}
          description={productDescription}
          thumbnailUrl={thumbnail.url || ''}
          price={productPrice / 100}
          currency={currency}
          canonicalUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/${slug}`}
          hasStock={hasStock}
        />
        <ProductPage
          diamondInformationStory={diamondInformationStory}
          sizeGuideStory={sizeGuideStory}
          product={product}
          language={locale}
          elasticData={elasticData}
        />
      </>
    );
  }

  switch (story?.content?.component) {
    case 'categoryPage':
      return (
        <CategoryPageComponent
          story={story as StoryblokStory<CategoryPage>}
          slug={joinedSlug}
          locale={locale}
          searchParams={resolvedSearchParams}
        />
      );
    case 'collectionPage': {
      return (
        <CollectionPageTemplate
          story={
            story as Required<
              Pick<CollectionStoryblokStory, 'id' | 'translated_slugs' | 'full_slug' | 'default_full_slug'>
            > &
              StoryblokStory<CollectionPage>
          }
          slug={joinedSlug}
          locale={locale}
          searchParams={resolvedSearchParams}
        />
      );
    }

    case 'cmsPage':
      return <CmsPageComponent story={story as CmsStoryblokStory} />;
    default: {
      notFound();
    }
  }
};

export default PageRoute;

// Dynamic configuration to prevent DYNAMIC_SERVER_USAGE errors
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Remove generateStaticParams when using force-dynamic to prevent build-time generation

export async function generateMetadata({ params, searchParams }: IPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const joinedSlug = slug.join('/');
  let canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/${joinedSlug}`;

  const resolvedSearchParams = await searchParams;
  if (resolvedSearchParams?.page && resolvedSearchParams.page !== '1') {
    canonicalUrl += `?page=${resolvedSearchParams.page}`;
  }

  // Check if this is a product page by looking at the slug pattern
  const isProductPage = joinedSlug.startsWith('p/');

  // For product pages during build, return minimal metadata
  if (isProductPage && isVercelBuild()) {
    return {
      title: 'Product',
      description: 'View product details',
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        siteName: process.env.NEXT_PUBLIC_BASE_URL || '',
        title: 'Product',
        description: 'View product details',
        url: canonicalUrl,
        type: 'website',
      },
    };
  }

  const { product, story } = await fetchPageDataSafe(locale, joinedSlug);

  if (story) {
    const content = story.content as Partial<CollectionPage> & Partial<CmsPage> & { title?: string };
    const seo = content.seo as Record<string, unknown> | undefined;
    const ogTitle: string =
      (typeof content.collectionMetaTitle === 'string' ? content.collectionMetaTitle : undefined) ||
      (typeof seo?.title === 'string' ? seo.title : undefined) ||
      (typeof content.title === 'string' ? content.title : undefined) ||
      'Page';
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

  if (product) {
    const { title, display_name, description, thumbnail, baseColorCode } = product;
    const colorTitle = baseColorCode?.title || '';
    const productTitle = `${title.split(' ')[0]} - ${display_name ?? ''} - ${colorTitle}`.trim() || undefined;
    // const productPrice = variants[0].price?.salePriceAmount ?? variants[0].price?.basePriceAmount ?? 0;
    const productDescription = description
      ? description
          .replace(/<(?:.|\n)*?>/gm, '')
          .replace(/\n/g, '')
          .substring(0, 200)
      : undefined;
    // const currency = locale === 'sv' ? 'SEK' : locale === 'no' ? 'NOK' : locale === 'fi' ? 'EUR' : 'EUR';

    return {
      title: productTitle,
      description: productDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        siteName: process.env.NEXT_PUBLIC_STORE_NAME || '',
        title: productTitle,
        images: thumbnail.url,
        description: productDescription,
        url: canonicalUrl,
        type: 'website',
        // product: {
        //   brand: process.env.NEXT_PUBLIC_STORE_NAME || '',
        //   retailer_item_id: sku,
        //   price: {
        //     amount: productPrice,
        //     currency,
        //   },
        // },
      },
    };
  }

  return {};
}
