import { isVercelBuild } from '../isVercelBuild';
import { fetchPageData, type PageData } from './fetchPageData';

/**
 * Safe wrapper for fetchPageData that handles DYNAMIC_SERVER_USAGE errors
 * This is specifically designed to work with Vercel's build process
 */
export async function fetchPageDataSafe(locale: string, slug: string): Promise<PageData> {
  // During build time, return minimal data to prevent DYNAMIC_SERVER_USAGE errors
  if (isVercelBuild()) {
    return {
      product: undefined,
      story: undefined,
      redirectUrl: undefined,
      sbConfig: { version: 'published', language: locale },
      isPreview: false,
    };
  }

  // For runtime, use the regular fetchPageData
  try {
    return await fetchPageData(locale, slug);
  } catch (error) {
    console.error('[fetchPageDataSafe] Error during runtime fetch:', error);
    // Return minimal data on error to prevent page crashes
    return {
      product: undefined,
      story: undefined,
      redirectUrl: undefined,
      sbConfig: { version: 'published', language: locale },
      isPreview: false,
    };
  }
}
