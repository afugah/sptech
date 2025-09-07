import { useEffect, useState } from 'react';
import { fetchRecommendedItems } from '@/src/components/recommendedList/actions';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

export const useFindifyProducts = (widgetId?: string, itemCount: number = 5) => {
  const marketCode = useMarketCode();
  const [products, setProducts] = useState<ICollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (widgetId) {
      setIsLoading(true);
      setError(null);

      fetchRecommendedItems(marketCode, widgetId, undefined, itemCount)
        .then(setProducts)
        .catch(setError)
        .finally(() => setIsLoading(false));
    } else {
      setProducts([]);
    }
  }, [widgetId, marketCode, itemCount]);

  return { products, isLoading, error };
};
