'use client';

import { Heart } from 'lucide-react';
import React from 'react';
import { useWishlist } from '@/src/hooks/useWishlist';
import { type ICollectionWishlistItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { Button } from '../../shadcn/button';

interface ProductData {
  id: string;
  sku: string;
  title?: string;
  display_name?: string;
  thumbnail?: {
    url: string;
    hoverUrl?: string | null;
  };
  slug?: string;
  price?: number;
  tags?: unknown[];
  description?: string;
  salePrice?: number | null;
}

interface WishlistButtonProps {
  product: ProductData;
  checkBy?: 'sku' | 'id';
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ product, checkBy = 'sku' }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isInWishlistCheck = checkBy === 'sku' ? product.sku : product.id;
  const isWishlisted = isInWishlist(isInWishlistCheck);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Convert product to wishlist item format with proper typing
    const wishlistItem: ICollectionWishlistItem = {
      id: product.id,
      sku: product.sku,
      title: product.title || product.display_name || '',
      display_name: product.display_name || product.title || '',
      thumbnail: {
        url: product.thumbnail?.url || '',
        hoverUrl: product.thumbnail?.hoverUrl || null,
      },
      slug: product.slug || '',
      price: typeof product.price === 'number' ? product.price * 100 : undefined,
      tags: Array.isArray(product.tags) ? product.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      description: product.description,
      salePrice: product.salePrice,
    };

    toggleWishlist(wishlistItem);
  };

  return (
    <Button
      variant={'custom'}
      aria-label={isWishlisted ? 'Remove product from wishlist' : 'Add product to wishlist'}
      className={'absolute right-0 z-10 transform p-4 transition-transform duration-150 hover:scale-110 [&_svg]:size-6'}
      type={'button'}
      onClick={handleToggle}
    >
      <Heart
        className={`mr-1 ${isWishlisted ? 'fill-backgroundAlternative stroke-backgroundAlternative' : 'stroke-backgroundAlternative'}`}
        size={16}
        strokeWidth={1}
      />
    </Button>
  );
};
