/**
 * PayloadCMS Live Preview Configuration
 *
 * Provides live preview functionality for PayloadCMS integration.
 * Allows real-time content updates in preview mode.
 */

export interface PayloadLivePreviewConfig {
  /** The PayloadCMS API URL */
  serverURL: string;
  /** Collection slug for the content being previewed */
  collection: string;
  /** Document ID for the content being previewed */
  id: string;
  /** API route for fetching live data */
  apiRoute?: string;
  /** Preview token for authentication */
  previewToken?: string;
}

/**
 * Default live preview configuration
 */
export const defaultLivePreviewConfig: Partial<PayloadLivePreviewConfig> = {
  serverURL: process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3000',
  apiRoute: '/api/preview',
  previewToken: process.env.PAYLOAD_PREVIEW_TOKEN,
};

/**
 * Generate live preview URL for PayloadCMS admin panel
 */
export function generatePreviewURL(collection: string, id: string, locale: string = 'en'): string {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3100';
  const previewToken = process.env.PAYLOAD_PREVIEW_TOKEN;

  const params = new URLSearchParams({
    collection,
    id,
    locale,
    ...(previewToken && { token: previewToken }),
    draft: 'true',
    preview: 'true',
  });

  return `${baseURL}/api/preview?${params.toString()}`;
}

/**
 * Check if current environment supports live preview
 */
export function isLivePreviewEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_ENABLE_LIVE_PREVIEW === 'true' &&
    process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL &&
    typeof window !== 'undefined'
  );
}

/**
 * Extract preview data from URL searchParams
 */
export function getPreviewDataFromURL(): {
  collection?: string;
  id?: string;
  locale?: string;
  token?: string;
  isPreview: boolean;
} {
  if (typeof window === 'undefined') {
    return { isPreview: false };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    collection: searchParams.get('collection') || undefined,
    id: searchParams.get('id') || undefined,
    locale: searchParams.get('locale') || undefined,
    token: searchParams.get('token') || undefined,
    isPreview: searchParams.has('preview') && searchParams.get('preview') === 'true',
  };
}
