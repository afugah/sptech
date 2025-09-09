import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { getCurrentCountry } from '@/src/lib/constants/markets';

export type ProductDataSource = 'findify' | 'elastic' | 'typesense' | 'storyblok' | 'none';

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
}

interface UseProductDataResult {
  product: ProductData | null;
  loading: boolean;
  error: string | null;
  source: ProductDataSource;
}

/**
 * Hook to fetch product data from Elastic search only.
 * Per requirements, we only use Elastic for individual product fetching.
 */
export function useProductDataWithFallback(id: string | null): UseProductDataResult {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<ProductDataSource>('none');
  const locale = useLocale();

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setSource('none');
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      setSource('none');

      try {
        // Get the selected country from localStorage
        const country = getCurrentCountry();

        // Determine which endpoint to use based on feature flag
        const useDirectApi = process.env.NEXT_PUBLIC_USE_DIRECT_ELASTIC_API === 'true';

        // Support gradual rollout with percentage
        const rolloutPercentage = parseInt(process.env.NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT || '0');
        const shouldUseDirectApi = useDirectApi || (rolloutPercentage > 0 && Math.random() * 100 < rolloutPercentage);

        // Choose endpoint based on configuration
        const endpoint = shouldUseDirectApi ? 'elasticsearch' : 'elastic';

        // Only use Elastic search for individual products
        const elasticResponse = await fetch(
          `/api/product/${endpoint}/${id}?locale=${locale}&country=${encodeURIComponent(country)}`,
        );

        if (elasticResponse.ok) {
          const elasticProduct = await elasticResponse.json();
          setProduct(elasticProduct);
          setSource('elastic');
          setLoading(false);
          return;
        }

        // Elastic search failed
        setProduct(null);
        setSource('none');
        setError(`Product not found in Elastic search: ${id}`);
      } catch (err) {
        setProduct(null);
        setSource('none');
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, locale]);

  return {
    product,
    loading,
    error,
    source,
  };
}
