'use client';

import classNames from 'classnames';
import { useFormatter } from 'next-intl';
import React from 'react';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { Link } from '@/src/i18n/navigation';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';
import { ProductImage } from './ProductImage';
import { ProductPrice } from './ProductPrice';
import { ProductTags } from './ProductTags';
import { WishlistButton } from './WishlistButton';

interface BaseProduct {
  id: string;
  sku: string;
  slug: string;
  title: string;
  price?: number;
  thumbnail?: {
    url: string;
    hoverUrl?: string | null;
  };
  tags?: unknown[];
  compareAt?: number;
  pricing?: IFindify.PricingStructure;
  created_at?: string;
  [key: string]: unknown;
}

interface ProductCardBaseProps {
  product: BaseProduct;
  showWishlist?: boolean;
  showTags?: boolean;
  showDate?: boolean;
  showSalePrice?: boolean;
  wishlistCheckBy?: 'sku' | 'id';
  cardClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  priceClassName?: string;
  children?: React.ReactNode;
}

export const ProductCardBase: React.FC<ProductCardBaseProps> = ({
  product,
  showWishlist = false,
  showTags = false,
  showDate = false,
  showSalePrice = true,
  wishlistCheckBy = 'sku',
  cardClassName = 'relative h-full shadow-lg w-full min-w-0',
  contentClassName = 'relative flex flex-1 flex-col justify-center bg-white px-2 py-2 text-center sm:px-3 sm:py-3 lg:py-4',
  titleClassName = 'mb-1 truncate px-1 font-sans text-xs font-bold uppercase tracking-wider sm:mb-2 lg:mb-3 lg:px-3 lg:text-md',
  priceClassName,
  children,
}) => {
  const { emitFeedback } = useFindifyAnalytics();
  const format = useFormatter();

  const { slug, thumbnail, title, tags, created_at } = product;

  const handleLinkClick = () => {
    emitFeedback({
      type: 'click-item',
      properties: { item_id: product.id, variant_item_id: product.sku },
    });
  };

  return (
    <div className={cardClassName}>
      {showWishlist && <WishlistButton product={product} checkBy={wishlistCheckBy} />}

      {showTags && <ProductTags tags={tags} />}

      <Link
        href={slug}
        onClick={handleLinkClick}
        className={classNames('flex flex-auto flex-col', {
          'hover:[&_.thumbnail>.thumbnail-hover]:opacity-100': !!thumbnail?.hoverUrl,
        })}
      >
        <ProductImage src={thumbnail?.url || ''} hoverSrc={thumbnail?.hoverUrl || undefined} alt={title} priority />

        <div className={contentClassName}>
          <hr
            className={
              'absolute left-1/2 top-0 mx-auto mb-3 w-3/5 -translate-x-1/2 transform border-gray-300 sm:mb-4 lg:mb-5 lg:w-2/5'
            }
          />

          <div className={'mb-2 flex flex-col tracking-wide'}>
            {showDate && created_at && (
              <span className={'mb-1 text-xs text-secondary opacity-50'}>
                {format.dateTime(new Date(created_at), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}

            <h2 className={titleClassName}>{title}</h2>

            {children ||
              (product.price && (
                <ProductPrice
                  price={product.price}
                  compareAt={product.compareAt}
                  pricing={product.pricing}
                  showSalePrice={showSalePrice}
                  className={priceClassName}
                />
              ))}
          </div>
        </div>
      </Link>
    </div>
  );
};
