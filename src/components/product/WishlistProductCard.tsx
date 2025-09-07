'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { type ICollectionWishlistItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { ProductCardBase, ProductPrice, ProductSourceLabel } from './shared';

interface ICardProps {
  product: ICollectionWishlistItem;
}

const WishlistProductCardComponent: React.FC<ICardProps> = ({ product }) => {
  const showDates = useSearchParams().get('showDates') === 'true';

  // Convert wishlist item to base product format
  const baseProduct = {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    title: product.title,
    price: typeof product.price === 'number' ? product.price / 100 : undefined, // Convert back from cents
    thumbnail: product.thumbnail,
    tags: product.tags,
    compareAt: product.salePrice ? (typeof product.price === 'number' ? product.price / 100 : undefined) : undefined,
    pricing: undefined, // Wishlist items don't have complex pricing structure
    created_at: undefined,
  };

  return (
    <ProductCardBase
      product={baseProduct}
      showWishlist={true}
      showTags={true}
      showDate={showDates}
      showSalePrice={true}
      wishlistCheckBy={'sku'}
    >
      <div className={'flex flex-col gap-1'}>
        <ProductSourceLabel source={'findify'} className={'mb-1 self-start'} />
        <ProductPrice
          price={baseProduct.price || 0}
          compareAt={baseProduct.compareAt}
          pricing={baseProduct.pricing}
          showSalePrice={true}
        />
      </div>
    </ProductCardBase>
  );
};

const WishlistProductCard: React.FC<ICardProps> = (props) => {
  return (
    <Suspense fallback={<div className={'bg-gray-100 h-96 animate-pulse rounded'} />}>
      <WishlistProductCardComponent {...props} />
    </Suspense>
  );
};

export default WishlistProductCard;
