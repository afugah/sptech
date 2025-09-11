'use client';

import classNames from 'classnames';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useFormatter } from 'next-intl';
import React, { useMemo } from 'react';
import { ProductTag } from '@/src/components/product/ProductTag';
import { useCart } from '@/src/context/cartContext';
import { useFindifyAnalytics } from '@/src/context/findifyAnalytics/findifyAnalyticsContext';
import { getAmount } from '@/src/helpers/money';
import { useMarket } from '@/src/hooks/useMarket';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link } from '@/src/i18n/navigation';
import { getCurrencyDiscountKey, getCurrencyPriceKey } from '@/src/lib/constants/markets';
import { useSimplePricing } from '@/src/lib/features';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';
import { Button } from '../shadcn/button';

interface ICardProps {
  product: ICollectionItem;
}

const InitialSearchProductCard: React.FC<ICardProps> = (props) => {
  const { product } = props;
  const { slug, thumbnail, title, price, pricing, tags, compare_at, created_at, custom_fields } = product;

  const { store } = useCart();
  const { marketCode, country, currency } = useMarket();
  const { getStoreGroupIdFromLocalStorage } = useCart();
  const storeGroupId = useMemo(() => getStoreGroupIdFromLocalStorage(), [getStoreGroupIdFromLocalStorage]);
  const format = useFormatter();
  const { emitFeedback } = useFindifyAnalytics();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSimplePricing = useSimplePricing();

  // Use currency from market hook
  const currencyCode = currency || store?.currencyCode || 'EUR';

  const productPrice = useMemo(() => {
    try {
      // Use simple pricing structure if enabled
      if (isSimplePricing && custom_fields) {
        // Use country from market hook for pricing
        const priceKey = getCurrencyPriceKey(country);
        const discountKey = getCurrencyDiscountKey(country);

        const priceValue = custom_fields[priceKey];
        const discountValue = custom_fields[discountKey];

        const regularPrice = priceValue
          ? Array.isArray(priceValue)
            ? parseFloat(priceValue[0])
            : parseFloat(priceValue)
          : price;

        const discountPercent = discountValue
          ? Array.isArray(discountValue)
            ? parseFloat(discountValue[0])
            : parseFloat(discountValue)
          : 0;

        const salePrice = discountPercent > 0 ? regularPrice * (1 - discountPercent / 100) : null;

        return {
          price: regularPrice,
          sale_price: salePrice,
        };
      }

      // Use complex pricing structure (existing logic)
      if (!pricing || !marketCode || !storeGroupId) return null;
      const membershipLevel = storeGroupId as IFindify.MembershipLevel;
      const localeKey = marketCode.toLocaleUpperCase() as IFindify.Locale;
      // Check if the pricing data exists for this membership level and locale
      if (!pricing[membershipLevel] || !pricing[membershipLevel][localeKey]) {
        console.warn(`Pricing data not found for membership level: ${membershipLevel} and locale: ${localeKey}`);
        return null;
      }
      return pricing[membershipLevel][localeKey];
    } catch (error) {
      console.error('Error calculating product price:', error);
      return null;
    }
  }, [pricing, storeGroupId, marketCode, isSimplePricing, custom_fields, price, country]);

  const isSale = useMemo(() => {
    try {
      if (productPrice?.price && productPrice?.sale_price && productPrice?.price > productPrice?.sale_price)
        return { price: productPrice.price, sale_price: productPrice.sale_price };
      else if (compare_at && compare_at > price) return { price: compare_at, sale_price: price };
      else return { price: price || 0, sale_price: null };
    } catch (error) {
      console.error('Error calculating sale price:', error);
      return { price: price || 0, sale_price: null };
    }
  }, [compare_at, productPrice?.price, productPrice?.sale_price, price]);

  const showDates = useSearchParams().get('showDates') === 'true';

  return (
    <div className={'relative h-full shadow-lg'}>
      <Button
        variant={'custom'}
        aria-label={isInWishlist(product.sku) ? 'Remove product from wishlist' : 'Add product to wishlist'}
        className={
          'absolute right-0 z-10 transform p-4 transition-transform duration-150 hover:scale-110 [&_svg]:size-6'
        }
        type={'button'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist({ ...product, price: product.price * 100 });
        }}
      >
        <Heart
          className={`mr-1 ${isInWishlist(product.sku) ? ' fill-backgroundAlternative stroke-backgroundAlternative ' : 'stroke-backgroundAlternative'}`}
          size={16}
          strokeWidth={1}
        />
      </Button>

      <div className={'absolute top-2 z-10 w-auto space-y-1 '}>
        {tags?.map(
          (tag) => Array.isArray(tag) && tag.length > 0 && tag.map((t, index) => <ProductTag key={index} tag={t} />),
        )}
      </div>

      <Link
        href={slug}
        onClick={() => {
          emitFeedback({
            type: 'click-item',
            properties: { item_id: product.id, variant_item_id: product.sku },
          });
        }}
        className={classNames('flex flex-auto flex-col', {
          'hover:[&_.thumbnail>.thumbnail-hover]:opacity-100': !!thumbnail.hoverUrl,
        })}
      >
        <div className={'relative w-full flex-1 overflow-hidden'}>
          <div className={'thumbnail contents'}>
            <Image
              src={thumbnail?.url || ''}
              alt={title}
              width={500}
              height={700}
              className={'h-full w-full'}
              priority
            />

            {!!thumbnail?.hoverUrl && (
              <div
                className={
                  'thumbnail-hover absolute left-0 right-0 top-0 flex h-full max-w-full items-center justify-center bg-white opacity-0 transition-opacity duration-300 ease-in-out'
                }
              >
                <Image
                  src={thumbnail?.hoverUrl || ''}
                  alt={title}
                  width={500}
                  height={700}
                  className={'h-full w-full'}
                />
              </div>
            )}
          </div>
          {/* <div className={'flex-start absolute bottom-4 left-4 flex flex-col items-start gap-2'}>
            {tags?.map(
              (tag) =>
                Array.isArray(tag) && tag.length > 0 && tag.map((t, index) => <ProductTag key={index} tag={t} />),
            )}
          </div> */}
        </div>

        <div className={'relative flex flex-1 flex-col justify-center bg-white px-3 py-3 text-center lg:py-4'}>
          <hr
            className={'absolute left-1/2 top-0 mx-auto mb-5 w-3/5 -translate-x-1/2 transform border-gray-300 lg:w-2/5'}
          />
          <div className={'mb-2 flex flex-col tracking-wide'}>
            {showDates && (
              <span className={'mb-1 text-xs text-secondary opacity-50'}>
                {format.dateTime(created_at, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            <h2
              className={
                'mb-1 truncate px-1 font-sans text-xs font-bold  uppercase tracking-wider lg:mb-3 lg:px-3 lg:text-md'
              }
            >
              {title}
            </h2>

            <span className={'text-sans flex h-5 flex-col text-xs uppercase tracking-wide lg:text-sm'}>
              <span className={isSale.sale_price !== null ? 'text-red' : 'text-black'}>
                {getAmount(
                  isSale.sale_price !== null ? isSale.sale_price * 100 : isSale.price * 100,
                  currencyCode,
                  marketCode,
                )}
              </span>
              {isSale.sale_price !== null && (
                <span className={'ml-2 text-secondary line-through'}>
                  {getAmount(isSale.price * 100, currencyCode, marketCode)}
                </span>
              )}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default InitialSearchProductCard;
