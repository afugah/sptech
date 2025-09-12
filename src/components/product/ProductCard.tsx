'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useFormatter, useLocale } from 'next-intl';
import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { ColorSelector } from '@/src/components/product/ColorSelector';
import { ProductTag } from '@/src/components/product/ProductTag';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { useOptionalCartActions } from '@/src/context/optimized/CartActionsContext';
import { useElasticProductData } from '@/src/hooks/useElasticProductData';
import { useTypesenseProductData } from '@/src/hooks/useTypesenseProductData';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';
import { ProductPrice } from './shared/ProductPrice';
import { ProductSourceLabel } from './shared/ProductSourceLabel';
import { WishlistButton } from './shared/WishlistButton';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardProps {
  product: Partial<ICollectionItem> | { id: string; name?: string; image?: string; product_sku?: string };
  variant?: 'default' | 'search' | 'wishlist' | 'storyblok';
  priority?: boolean; // For image loading priority
  showWishlist?: boolean;
  showTags?: boolean;
  showDate?: boolean;
  showColorSelector?: boolean;
  showSourceLabel?: boolean;
  wishlistCheckBy?: 'sku' | 'id';
  onProductClick?: (product: unknown) => void;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  priceClassName?: string;
}

// ============================================================================
// Custom Hooks for Performance
// ============================================================================

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

// ============================================================================
// Storyblok Data Fetcher Component
// ============================================================================

const StoryblokDataFetcher: React.FC<{
  productId: string;
  children: (data: { product: ICollectionItem | null; loading: boolean; error: unknown }) => React.ReactNode;
}> = ({ productId, children }) => {
  const useTypesense = process.env.NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API === 'true';

  const {
    product: elasticProduct,
    loading: elasticLoading,
    error: elasticError,
  } = useElasticProductData(useTypesense ? null : productId);

  const {
    product: typesenseProduct,
    loading: typesenseLoading,
    error: typesenseError,
  } = useTypesenseProductData(useTypesense ? productId : null);

  const product = useTypesense ? typesenseProduct : elasticProduct;
  const loading = useTypesense ? typesenseLoading : elasticLoading;
  const error = useTypesense ? typesenseError : elasticError;

  return <>{children({ product, loading, error })}</>;
};

// ============================================================================
// Main Component
// ============================================================================

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  priority = false,
  showWishlist = false,
  showTags = true,
  showDate = false,
  showColorSelector = true,
  showSourceLabel = false,
  wishlistCheckBy = 'sku',
  onProductClick,
  className = 'relative h-full w-full min-w-0 group',
  imageClassName = 'aspect-[4/5] w-full object-cover object-center',
  contentClassName = '',
  titleClassName = 'mb-2 text-sm font-normal text-gray-900 leading-tight',
  priceClassName = 'text-sm font-medium text-gray-900',
}) => {
  // All hooks must be called at the top level
  // State for hover image preview
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Contexts and hooks
  const cartActions = useOptionalCartActions();
  const storeGroupId = useMemo(() => cartActions?.getStoreGroupIdFromLocalStorage?.(), [cartActions]);
  const locale = useLocale();
  const format = useFormatter();
  const { emitFeedback } = useFindifyAnalytics();
  const searchParams = useSearchParams();
  const showDates = searchParams.get('showDates') === 'true' || showDate;

  // Determine currency code (should come from store context)
  const currencyCode = useMemo(() => {
    // This should come from a store context or similar
    return 'SEK'; // Default or derive from locale/store
  }, []);

  // Type guards for product data
  const hasFullProductData = (p: unknown): p is ICollectionItem => {
    return p !== null && typeof p === 'object' && 'slug' in p && 'title' in p;
  };

  const isValidProduct = hasFullProductData(product);

  // Price calculations - must be called even if product is invalid
  const productPrice = useProductPrice(isValidProduct ? product.pricing : undefined, locale, storeGroupId);
  const formattedPrice = useFormattedPrice(
    isValidProduct ? product.price : undefined,
    isValidProduct ? product.compare_at || undefined : undefined,
    productPrice,
    currencyCode,
    format,
  );

  // Memoized product tags
  const productTags = useMemo(() => {
    if (!showTags || !isValidProduct) return [];
    if (!product.tags || !Array.isArray(product.tags)) return [];

    const currentDate = new Date();
    const productDate = new Date(product.created_at || Date.now());
    const daysDifference = Math.floor((currentDate.getTime() - productDate.getTime()) / (1000 * 3600 * 24));

    const computedTags = [...product.tags];

    // Add "New" tag if product is less than 30 days old
    if (daysDifference <= 30) {
      computedTags.push('New');
    }

    // Add "Sale" tag if there's a discount
    if (formattedPrice?.hasDiscount) {
      computedTags.push('Sale');
    }

    return computedTags;
  }, [showTags, isValidProduct, product, formattedPrice?.hasDiscount]);

  // Event handlers
  const handleProductClick = useCallback(() => {
    if (!isValidProduct) return;

    // Analytics tracking
    if (emitFeedback) {
      emitFeedback({
        type: 'click-item',
        properties: {
          item_id: product.id,
          variant_item_id: product.sku,
        },
      });
    }

    // Custom click handler
    if (onProductClick) {
      onProductClick(product);
    }
  }, [emitFeedback, product, onProductClick, isValidProduct]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  }, []);

  // Handle Storyblok variant that needs data fetching
  if (variant === 'storyblok' && 'id' in product && !('slug' in product)) {
    return (
      <StoryblokDataFetcher productId={product.id}>
        {({ product: fetchedProduct, loading, error }) => {
          if (loading) {
            return <div className={'bg-gray-100 h-96 animate-pulse rounded'} />;
          }

          if (error || !fetchedProduct) {
            if (process.env.NODE_ENV === 'development') {
              return (
                <div
                  className={
                    'bg-red-50 border-red-200 flex h-full flex-col items-center justify-center rounded border p-4'
                  }
                >
                  <div className={'text-red-700 text-center'}>
                    <h3 className={'text-sm font-bold'}>Product Not Found</h3>
                    <p className={'mt-2 text-xs'}>Product ID: {product.id}</p>
                  </div>
                </div>
              );
            }
            return null;
          }

          return (
            <ProductCardComponent
              {...{
                product: fetchedProduct,
                variant: 'default',
                priority,
                showWishlist,
                showTags,
                showDate,
                showColorSelector,
                showSourceLabel,
                wishlistCheckBy,
                onProductClick,
                className,
                imageClassName,
                contentClassName,
                titleClassName,
                priceClassName,
              }}
            />
          );
        }}
      </StoryblokDataFetcher>
    );
  }

  if (!isValidProduct) {
    return null;
  }

  // Determine image source
  const imageUrl = hoveredImage || product.thumbnail?.url || '';
  const hoverImageUrl = product.thumbnail?.hoverUrl;

  // Variant-specific rendering adjustments
  const isWishlistVariant = variant === 'wishlist';

  return (
    <div className={className}>
      {/* Wishlist button (absolute positioned) */}
      {showWishlist && <WishlistButton product={product} checkBy={wishlistCheckBy} />}

      {/* Tags (absolute positioned) */}
      {showTags && productTags.length > 0 && (
        <div className={'absolute left-2 top-2 z-10 flex flex-wrap gap-1'}>
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

      <Link
        href={product.slug}
        onClick={handleProductClick}
        className={classNames('relative flex flex-auto flex-col', {
          'hover:[&_.thumbnail>.thumbnail-hover]:opacity-100': !!hoverImageUrl,
        })}
        aria-label={`View ${product.title}`}
      >
        {/* Image Container */}
        <div className={'relative aspect-[4/5] w-full overflow-hidden bg-gray-200'}>
          <Image
            src={imageUrl}
            alt={product.title}
            width={400}
            height={500}
            priority={priority}
            className={imageClassName}
            onError={handleImageError}
          />

          {/* Hover overlay */}
          {hoverImageUrl && (
            <Image
              src={hoverImageUrl}
              alt={`${product.title} alternate view`}
              width={400}
              height={500}
              className={classNames(
                imageClassName,
                'absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100',
              )}
            />
          )}

          {/* Discount Badge */}
          {formattedPrice?.hasDiscount && (
            <div className={'bg-red-500 absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs text-white'}>
              -{formattedPrice.discountPercentage}%
            </div>
          )}

          {/* Product Info - Positioned absolutely over the image */}
          <div className={classNames('absolute bottom-4 left-4 flex flex-col', contentClassName)}>
            {/* Date (if enabled) */}
            {showDates && product.created_at && (
              <span className={'text-xs text-gray-500'}>
                {format.dateTime(new Date(product.created_at), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}

            {/* Title */}
            <h3 className={titleClassName}>{product.title}</h3>

            {/* Color Selector */}
            {showColorSelector && product.productGroupProducts && product.productGroupProducts.length > 1 && (
              <ColorSelector
                productGroupProducts={product.productGroupProducts}
                currentProductId={product.id}
                onImageHover={setHoveredImage}
                className={'py-1'}
              />
            )}

            {/* Source Label (for wishlist/debug) */}
            {showSourceLabel && <ProductSourceLabel source={'findify'} className={'mb-1 self-start'} />}

            {/* Price Display */}
            {isWishlistVariant ? (
              // Wishlist variant uses ProductPrice component
              <ProductPrice
                price={product.price || 0}
                compareAt={product.compare_at}
                pricing={product.pricing}
                showSalePrice={true}
                className={priceClassName}
              />
            ) : formattedPrice ? (
              // Regular variants use formatted price
              <div className={'flex items-center gap-2'}>
                <span className={priceClassName}>{formattedPrice.price}</span>
                {formattedPrice.comparePrice && formattedPrice.hasDiscount && (
                  <span className={'text-sm text-gray-500 line-through'}>{formattedPrice.comparePrice}</span>
                )}
              </div>
            ) : product.price ? (
              // Fallback to ProductPrice component
              <ProductPrice
                price={product.price}
                compareAt={product.compare_at}
                pricing={product.pricing}
                showSalePrice={true}
                className={priceClassName}
              />
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
};

// ============================================================================
// Export with Suspense wrapper
// ============================================================================

const ProductCard: React.FC<ProductCardProps> = React.memo((props) => {
  return (
    <Suspense fallback={<div className={'bg-gray-100 h-96 animate-pulse rounded'} />}>
      <ProductCardComponent {...props} />
    </Suspense>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
