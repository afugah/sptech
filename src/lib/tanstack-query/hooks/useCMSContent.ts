/**
 * Strategic CMS content hooks with optimized cache timing
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { QUERY_CONFIGS, QUERY_KEYS } from '../queryConfig';

/**
 * Hook for static CMS content (pages, landing pages)
 * Uses long cache duration for content that changes infrequently
 */
export function useStaticContent<T>(
  slug: string,
  locale: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
    version?: 'draft' | 'published';
  } = {},
) {
  const { enabled = true, version = 'published' } = options;

  return useQuery({
    ...QUERY_CONFIGS.staticContent([QUERY_KEYS.CMS_CONTENT, 'static', slug, locale, version], fetcher),
    enabled: enabled && !!slug && !!locale,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for navigation content
 * Uses medium cache duration with background refresh
 */
export function useNavigationContent<T>(
  type: 'header' | 'footer' | 'menu',
  locale: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.navigation([QUERY_KEYS.NAVIGATION, type, locale], fetcher),
    enabled: enabled && !!locale,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for global settings and configuration
 * Uses long cache duration for settings that rarely change
 */
export function useGlobalSettings<T>(
  locale: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.staticContent([QUERY_KEYS.GLOBAL_SETTINGS, locale], fetcher),
    enabled: enabled && !!locale,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for product-related CMS content
 * Uses shorter cache duration for content that may change frequently
 */
export function useProductContent<T>(
  slug: string,
  locale: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
    version?: 'draft' | 'published';
  } = {},
) {
  const { enabled = true, version = 'published' } = options;

  return useQuery({
    ...QUERY_CONFIGS.products([QUERY_KEYS.CMS_CONTENT, 'product', slug, locale, version], fetcher),
    enabled: enabled && !!slug && !!locale,
  }) as UseQueryResult<T, Error>;
}

/**
 * Hook for reference content (size guides, care instructions)
 * Uses medium cache duration for reference materials
 */
export function useReferenceContent<T>(
  type: 'size-guide' | 'care-instructions' | 'diamond-information',
  locale: string,
  fetcher: () => Promise<T>,
  options: {
    enabled?: boolean;
  } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    ...QUERY_CONFIGS.staticContent([QUERY_KEYS.CMS_CONTENT, 'reference', type, locale], fetcher),
    enabled: enabled && !!locale,
  }) as UseQueryResult<T, Error>;
}
