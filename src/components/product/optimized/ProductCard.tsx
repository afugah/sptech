'use client';

import Heart from '@images/icons/heart.svg';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useFormatter } from 'next-intl';
import React, { useCallback, useMemo } from 'react';
import { ProductTag } from '@/src/components/product/ProductTag';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { useOptionalCartActions } from '@/src/context/optimized/CartActionsContext';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';

interface ICardProps {
  product: ICollectionItem;
  priority?: boolean; // For image loading priority
  onProductClick?: (product: ICollectionItem) => void;
}

// Utility hook for price calculation - memoized for performance
const useProductPrice = (pricing: ICollectionItem['pricing'], locale: string, storeGroupId: string | undefined) => {
  return useMemo(() => {
    try {
      if (!pricing || !locale || !storeGroupId) return null;

      const membershipLevel = storeGroupId as IFindify.MembershipLevel;
      const localeKey = locale.toUpperCase() as IFindify.Locale;

      // Check if the pricing data exists for this membership level and locale
      if (!pricing[membershipLevel] || !pricing[membershipLevel][localeKey]) {
        return null;
      }

      return pricing[membershipLevel][localeKey];
    } catch (error) {
      console.error('Error calculating product price:', error);
      return null;
    }
  }, [pricing, storeGroupId, locale]);
};

// Utility hook for formatted pricing display
const useFormattedPrice = (
  price: number | undefined,
  compareAtPrice: number | undefined,
  productPrice: unknown,
  currencyCode: string | undefined,
  format: unknown,
) => {
  return useMemo(() => {
    try {
      let finalPrice = price;
      let finalComparePrice = compareAtPrice;

      // Use specific pricing if available
      if (
        productPrice &&
        typeof productPrice === 'object' &&
        'price' in productPrice &&
        typeof productPrice.price === 'number'
      ) {
        finalPrice = productPrice.price;
      }
      if (
        productPrice &&
        typeof productPrice === 'object' &&
        'compare_at_price' in productPrice &&
        typeof productPrice.compare_at_price === 'number'
      ) {
        finalComparePrice = productPrice.compare_at_price;
      }

      if (!finalPrice || !currencyCode || !format || typeof format !== 'object' || !('number' in format)) return null;

      const formatter = format as { number: (value: number, options: Intl.NumberFormatOptions) => string };

      // Prices are already in major units (SEK, not öre)
      const formattedPrice = formatter.number(finalPrice, {
        style: 'currency',
        currency: currencyCode,
      });

      const formattedComparePrice = finalComparePrice
        ? formatter.number(finalComparePrice, {
            style: 'currency',
            currency: currencyCode,
          })
        : null;

      const hasDiscount = finalComparePrice && finalComparePrice > finalPrice;

      return {
        price: formattedPrice,
        comparePrice: formattedComparePrice,
        hasDiscount,
        discountPercentage:
          hasDiscount && finalComparePrice
            ? Math.round(((finalComparePrice - finalPrice) / finalComparePrice) * 100)
            : 0,
      };
    } catch (error) {
      console.error('Error formatting price:', error);
      return null;
    }
  }, [price, compareAtPrice, productPrice, currencyCode, format]);
};

const ProductCard: React.FC<ICardProps> = React.memo(({ product, priority = false, onProductClick }) => {
  const { slug, thumbnail, title, price, pricing, tags, compare_at, created_at } = product;

  // Optimized context usage - only get what we need, handle when context is not available
  const cartActions = useOptionalCartActions();
  const storeGroupId = useMemo(() => cartActions?.getStoreGroupIdFromLocalStorage?.(), [cartActions]);

  const locale = useLocale();
  const format = useFormatter();
  const { emitFeedback } = useFindifyAnalytics();

  // Memoized store data - avoid re-computing on every render
  const currencyCode = useMemo(() => {
    // This should come from a store context or similar
    return 'SEK'; // Default or derive from locale/store
  }, []);

  // Custom hooks for performance
  const productPrice = useProductPrice(pricing, locale, storeGroupId);
  const formattedPrice = useFormattedPrice(price, compare_at || undefined, productPrice, currencyCode, format);

  // Memoized product tags to prevent unnecessary re-renders
  const productTags = useMemo(() => {
    if (!tags || !Array.isArray(tags)) return [];

    const currentDate = new Date();
    const productDate = new Date(created_at);
    const daysDifference = Math.floor((currentDate.getTime() - productDate.getTime()) / (1000 * 3600 * 24));

    const computedTags = [...tags];

    // Add "New" tag if product is less than 30 days old
    if (daysDifference <= 30) {
      computedTags.push('New');
    }

    // Add "Sale" tag if there's a discount
    if (formattedPrice?.hasDiscount) {
      computedTags.push('Sale');
    }

    return computedTags;
  }, [tags, created_at, formattedPrice?.hasDiscount]);

  // Optimized click handlers
  const handleProductClick = useCallback(() => {
    // Analytics tracking
    if (emitFeedback) {
      emitFeedback({
        type: 'click-item',
        properties: {
          item_id: product.id || slug,
          variant_item_id: product.id || slug,
        },
      });
    }

    // Custom click handler
    if (onProductClick) {
      onProductClick(product);
    }
  }, [emitFeedback, product, slug, onProductClick]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    // Handle image load errors gracefully
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  }, []);

  // Memoized image props
  const imageProps = useMemo(
    () => ({
      src: typeof thumbnail === 'string' ? thumbnail : thumbnail?.url || '',
      alt: title,
      width: 400,
      height: 500,
      priority,
      className:
        'aspect-[4/5] w-full object-cover object-center transition-transform duration-300 group-hover:scale-105',
      onError: handleImageError,
    }),
    [thumbnail, title, priority, handleImageError],
  );

  return (
    <div className={'group relative'}>
      <Link href={slug} onClick={handleProductClick} className={'block'} aria-label={`View ${title}`}>
        {/* Image Container */}
        <div className={'relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-200'}>
          <Image {...imageProps} alt={imageProps.alt || ''} />

          {/* Overlay for hover effects */}
          <div
            className={
              'absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-10'
            }
          />

          {/* Tags */}
          {productTags.length > 0 && (
            <div className={'absolute left-2 top-2 flex flex-wrap gap-1'}>
              {productTags.slice(0, 2).map((tag, index) => (
                <ProductTag
                  key={`${tag}-${index}`}
                  tag={{
                    title: tag,
                    backgroundColor: tag === 'Sale' ? '#dc2626' : tag === 'New' ? '#059669' : '#6b7280',
                    textColor: '#ffffff',
                  }}
                />
              ))}
            </div>
          )}

          {/* Discount Badge */}
          {formattedPrice?.hasDiscount && (
            <div className={'bg-red-500 absolute right-2 top-2 rounded px-2 py-1 text-xs text-white'}>
              -{formattedPrice.discountPercentage}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={'mt-4 space-y-2'}>
          <h3 className={'line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-700'}>
            {title}
          </h3>

          {/* Price Display */}
          {formattedPrice && (
            <div className={'flex items-center gap-2'}>
              <span className={'text-lg font-semibold text-gray-900'}>{formattedPrice.price}</span>
              {formattedPrice.comparePrice && formattedPrice.hasDiscount && (
                <span className={'text-sm text-gray-500 line-through'}>{formattedPrice.comparePrice}</span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        className={
          'hover:bg-gray-50 absolute right-2 top-2 rounded-full bg-white p-2 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100'
        }
        aria-label={`Add ${title} to wishlist`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Implement wishlist functionality
        }}
      >
        <Heart className={'h-4 w-4 text-gray-600'} />
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
