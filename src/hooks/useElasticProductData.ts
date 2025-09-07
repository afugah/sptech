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

interface UseElasticProductDataResult {
  product: ProductData | null;
  loading: boolean;
  error: string | null;
}

// In-memory cache to prevent excessive API calls
const cache = new Map<string, { data: ProductData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache on module load to ensure fresh data with improved product selection logic
cache.clear();

/**
 * Hook to fetch product data exclusively from Elastic search using product ID.
 * Includes caching to prevent excessive API calls.
 */
export function useElasticProductData(productId: string | null): UseElasticProductDataResult {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const getCacheKey = useCallback((id: string, loc: string) => `${id}-${loc}`, []);

  const fetchFromElastic = useCallback(
    async (id: string, loc: string) => {
      const cacheKey = getCacheKey(id, loc);
      const cached = cache.get(cacheKey);

      // Check if we have cached data that's still valid
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Get the selected country from localStorage
      const country = getCurrentCountry();

      // Fetch from API with country parameter for correct currency
      // Use minimal fields for StoryblokProductCard to reduce data transfer
      const apiUrl = `/api/product/elastic/${id}?locale=${loc}&country=${encodeURIComponent(country)}&fields=minimal`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch product from Elastic: ${response.status}`);
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
        const productData = await fetchFromElastic(productId, locale);
        setProduct(productData);
      } catch (err) {
        setProduct(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, locale, fetchFromElastic]);

  return {
    product,
    loading,
    error,
  };
}

// Export function to clear cache if needed
export function clearElasticProductCache() {
  cache.clear();
}

// Export function to get cache stats for debugging
export function getElasticProductCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp,
    })),
  };
}
