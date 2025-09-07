import { type ISbStoriesParams } from '@storyblok/react';
import { di } from '@/src/lib/di';
import { ProductService } from '@/src/lib/framework/Product/services/ProductService';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';

// Known Storyblok paths that should never be treated as product slugs
const STORYBLOK_PATHS = ['content', 'home', 'live-shopping', 'pages', 'journal', 'size-guide'];

type StoryblokContent = Record<string, unknown>;

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

export type PageData = {
  product?: Awaited<ReturnType<ProductService['getItemByID']>>;
  story?: StoryblokStory;
  redirectUrl?: string;
  sbConfig?: ISbStoriesParams;
  isPreview?: boolean;
  // rating?: Awaited<ReturnType<typeof getProductReviewScore>>;
};

export async function fetchPageData(locale: string, slug: string): Promise<PageData> {
  try {
    // Check if this is a product page (slug starts with 'p/')
    const isProductPage = slug.startsWith('p/');

    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);
    const version = isPreviewEnvironment() ? 'draft' : 'published';
    const sbConfig: ISbStoriesParams = { version, language };
    const isPreview = isPreviewEnvironment();

    // Only try to fetch story if it's not a product page
    let story;
    if (!isProductPage) {
      try {
        const storyblokApi = getStoryblokInstance();
        const { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbConfig);
        story = data?.story;
      } catch {
        // Ignore error when story is not found
      }
    }

    let product;
    // let rating;
    let redirectUrl: string | undefined;
    // Try to fetch product if it's a product page OR if no story was found and it's not a known Storyblok path
    if (isProductPage || (!story && !STORYBLOK_PATHS.includes(slug))) {
      try {
        const productService = di.resolve(ProductService);
        try {
          product = await productService.getItemBySlug(locale, slug);
        } catch {
          const idMatch = slug.match(/-(\d+)$/);
          if (idMatch) {
            const id = idMatch[1];
            product = await productService.getItemByID(locale, id);
            if (product) {
              redirectUrl = product.slug;
            }
          }
        }

        // Fetch rating for the product if found
        // if (product?.sku && process.env.REVIEWS_PROVIDER) {
        //   try {
        //     rating = await getProductReviewScore(product.sku);
        //   } catch (error) {
        //     console.error(`[INFO] fetching rating for product "${product.sku}"`, error);
        //   }
        // }
      } catch (error) {
        console.error(`[ERROR] fetching product "/${slug}" for locale "${locale}"`, error);
      }
    }

    return { product, story, redirectUrl, sbConfig, isPreview };
  } catch (error) {
    console.error(`[ERROR] fetchPageData failed for locale "${locale}" and slug "${slug}":`, error);
    // Ensure error is serializable for RSC by converting to plain object
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    // For non-Error objects, convert to a serializable format
    throw new Error(typeof error === 'string' ? error : 'Unknown error occurred');
  }
}
