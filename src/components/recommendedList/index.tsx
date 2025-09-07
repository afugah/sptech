'use client';

import React, { useEffect, useState } from 'react';
import { ProductGridStatic } from '@/src/components/product/ProductGrid/ProductGridStatic';
import { fetchRecommendedItems } from '@/src/components/recommendedList/actions';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import Loader from '../ui/Loader';

interface IRecommendedListProps {
  title?: string;
  take?: number;

  itemId?: string;
  slot: string;

  children?: React.ReactNode;
}

export const RecommendedList: React.FC<IRecommendedListProps> = (props) => {
  const { title, take, itemId, slot, children } = props;

  const [productList, setProductList] = useState<ICollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const marketCode = useMarketCode();

  useEffect(() => {
    setIsLoading(true);
    fetchRecommendedItems(marketCode, slot, itemId, take)
      .then(setProductList)
      .finally(() => setIsLoading(false));
  }, [itemId, marketCode, slot, take]);

  if (isLoading)
    return (
      <div className={'relative my-16 flex flex-row items-center justify-center'}>
        <Loader inverted />
      </div>
    );

  if (!productList.length) return null;

  return (
    <div className={'container mx-auto mb-16 mt-16 flex flex-col'}>
      {!!title && <h2 className={'mb-6 text-3xl font-medium'}>{title}</h2>}

      <ProductGridStatic className={'mb-4'} productList={productList} />

      {children}
    </div>
  );
};
