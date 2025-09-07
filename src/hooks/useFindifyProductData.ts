import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

/**
 * Hook to fetch complete product data from Findify using SKU.
 * This provides full product information including pricing, images, etc.
 */
export function useFindifyProductData(sku: string | null) {
  const [data, setData] = useState<ICollectionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!sku) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchProductData = async () => {
      try {
        const response = await fetch(`/api/product/findify/${sku}?locale=${locale}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch product data for SKU: ${sku}`);
        }

        const productData = await response.json();
        setData(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching Findify product data:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [sku, locale]);

  return {
    product: data,
    loading,
    error,
  };
}
