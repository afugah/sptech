'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { ProductCardBase, ProductPrice } from './shared';

interface ICardProps {
  product: ICollectionItem;
}

const CardComponent: React.FC<ICardProps> = ({ product }) => {
  const showDates = useSearchParams().get('showDates') === 'true';

  // Convert ICollectionItem to BaseProduct format
  const baseProduct = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    title: product.title,
    price: product.price,
    thumbnail: product.thumbnail,
    tags: product.tags,
    compareAt: product.compare_at ?? undefined,
    pricing: product.pricing,
    created_at: typeof product.created_at === 'string' ? product.created_at : undefined,
  };

  return (
    <ProductCardBase
      product={baseProduct}
      showWishlist={true}
      showTags={true}
      showDate={showDates}
      showSalePrice={true}
      wishlistCheckBy={'id'}
    >
      <div className={'flex flex-col gap-1'}>
        <ProductPrice
          price={product.price}
          compareAt={product.compare_at ?? undefined}
          pricing={product.pricing}
          customFields={product.custom_fields}
          showSalePrice={true}
        />
      </div>
    </ProductCardBase>
  );
};

const Card: React.FC<ICardProps> = (props) => {
  return (
    <Suspense fallback={<div className={'bg-gray-100 h-96 animate-pulse rounded'} />}>
      <CardComponent {...props} />
    </Suspense>
  );
};

export default Card;
