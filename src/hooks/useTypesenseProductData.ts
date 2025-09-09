import { useLocale } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getCurrentCountry } from '@/src/lib/constants/markets';

interface ProductData {
  id: string;
  sku: string;
  title: string;
  slug: string;
  price?: number;
  compareAt?: number;
  thumbnail?: {
    url: string;
    hoverUrl?: string;
  };
  tags?: string[];
  pricing?: Record<string, unknown>;
  created_at?: string;
  stock?: number;
  custom_fields?: Record<string, string[] | string>;
}

interface UseTypesenseProductDataResult {
  product: ProductData | null;
  loading: boolean;
  error: string | null;
}

// In-memory cache to prevent excessive API calls
const cache = new Map<string, { data: ProductData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache on module load to ensure fresh data
cache.clear();

/**
 * Hook to fetch product data from Typesense search using product ID.
 * Includes caching to prevent excessive API calls.
 */
export function useTypesenseProductData(productId: string | null): UseTypesenseProductDataResult {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const getCacheKey = useCallback((id: string, loc: string) => `${id}-${loc}`, []);

  const fetchFromTypesense = useCallback(
    async (id: string, loc: string) => {
      const cacheKey = getCacheKey(id, loc);
      const cached = cache.get(cacheKey);

      // Check if we have cached data that's still valid
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Get the selected country from localStorage
      const country = getCurrentCountry();

      // Determine which endpoint to use based on feature flag
      const useDirectApi = process.env.NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API === 'true';

      // Support gradual rollout with percentage
      const rolloutPercentage = parseInt(process.env.NEXT_PUBLIC_TYPESENSE_DIRECT_ROLLOUT || '0');
      const shouldUseDirectApi = useDirectApi || (rolloutPercentage > 0 && Math.random() * 100 < rolloutPercentage);

      if (!shouldUseDirectApi) {
        throw new Error('Typesense direct API is not enabled');
      }

      // Fetch from API with country parameter for correct currency
      // Use minimal fields for StoryblokProductCard to reduce data transfer
      const apiUrl = `/api/product/typesense/${id}?locale=${loc}&country=${encodeURIComponent(country)}&fields=minimal`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch product from Typesense: ${response.status}`);
      }

      const productData = await response.json();

      // Cache the result
      cache.set(cacheKey, {
        data: productData,
        timestamp: Date.now(),
      });

      return productData;
    },
    [getCacheKey],
  );

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setError(null);
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        const productData = await fetchFromTypesense(productId, locale);
        setProduct(productData);
      } catch (err) {
        setProduct(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, locale, fetchFromTypesense]);

  return {
    product,
    loading,
    error,
  };
}

// Export function to clear cache if needed
export function clearTypesenseProductCache() {
  cache.clear();
}

// Export function to get cache stats for debugging
export function getTypesenseProductCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp,
    })),
  };
}
