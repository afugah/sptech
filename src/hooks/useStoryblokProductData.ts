import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

interface StoryblokProductData {
  id: string;
  slug: string;
  sku: string;
}

/**
 * Hook to resolve missing product data for Storyblok components.
 * This is used when Storyblok doesn't provide complete product information
 * and we need to fetch slug/SKU from Findify.
 */
export function useStoryblokProductData(productId: string) {
  const [data, setData] = useState<StoryblokProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setError(null);

    const fetchSlug = async () => {
      try {
        const response = await fetch(`/api/product/slug/${productId}?locale=${locale}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product slug');
        }

        const slugData = await response.json();
        setData(slugData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching product slug:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlug();
  }, [productId, locale]);

  return {
    slug: data?.slug || null,
    sku: data?.sku || null,
    loading,
    error,
  };
}
