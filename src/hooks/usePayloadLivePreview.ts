'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';
import {
  getPreviewDataFromURL,
  isLivePreviewEnabled,
  type PayloadLivePreviewConfig,
} from '@/src/lib/payload/live-preview';

/**
 * Custom hook for PayloadCMS live preview integration
 *
 * Provides live preview data and state management for PayloadCMS content.
 * Automatically handles preview mode detection and data fetching.
 */
export function usePayloadLivePreview<T = unknown>(
  initialData: T,
  config: Partial<PayloadLivePreviewConfig> = {},
): {
  data: T;
  isLivePreview: boolean;
  isLoading: boolean;
  error?: Error;
} {
  const _searchParams = useSearchParams();
  const isEnabled = isLivePreviewEnabled();
  const previewData = getPreviewDataFromURL();

  // Memoize the live preview configuration
  const livePreviewConfig = useMemo(() => {
    if (!isEnabled || !previewData.isPreview) {
      return null;
    }

    return {
      serverURL: process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3000',
      collection: config.collection || previewData.collection || 'pages',
      id: config.id || previewData.id || '',
      apiRoute: config.apiRoute || '/api/preview',
      ...config,
    } as PayloadLivePreviewConfig;
  }, [isEnabled, previewData, config]);

  // Custom live preview state management
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  // Fetch live preview data when in preview mode
  useEffect(() => {
    if (!isEnabled || !previewData.isPreview || !livePreviewConfig) {
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError(undefined);

    const fetchPreviewData = async () => {
      try {
        const apiUrl = `${livePreviewConfig.apiRoute}?collection=${livePreviewConfig.collection}&id=${livePreviewConfig.id}&locale=${previewData.locale || 'en'}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Preview API request failed: ${response.statusText}`);
        }

        const result = await response.json();

        if (!isCancelled) {
          setData(result.data || initialData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch preview data'));
          setData(initialData);
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchPreviewData();

    // Set up polling for live updates every 2 seconds
    const interval = setInterval(fetchPreviewData, 2000);

    // Cleanup
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isEnabled, previewData, livePreviewConfig, initialData]);

  // Return appropriate data based on preview state
  if (!isEnabled || !previewData.isPreview) {
    return {
      data: initialData,
      isLivePreview: false,
      isLoading: false,
    };
  }

  return {
    data,
    isLivePreview: true,
    isLoading,
    error,
  };
}

/**
 * Hook for store locator live preview specifically
 */
export function useStoreLocatorLivePreview(initialStores: { [country: string]: IStore[] }) {
  const _searchParams = useSearchParams();
  const previewData = getPreviewDataFromURL();

  return usePayloadLivePreview(initialStores, {
    collection: 'stores',
    id: previewData.id || 'store-locator',
    apiRoute: '/api/stores/preview',
  });
}

/**
 * Hook to check if current page is in live preview mode
 */
export function useIsLivePreview(): boolean {
  const previewData = getPreviewDataFromURL();
  return isLivePreviewEnabled() && previewData.isPreview;
}

/**
 * Hook to get preview URL parameters
 */
export function usePreviewParams() {
  return getPreviewDataFromURL();
}
