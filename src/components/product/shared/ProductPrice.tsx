'use client';

import React, { useMemo } from 'react';
import { useCart } from '@/src/context/cartContext';
import { useMarket } from '@/src/hooks/useMarket';
import { getCurrencyDiscountKey, getCurrencyPriceKey } from '@/src/lib/constants/markets';
import { useSimplePricing } from '@/src/lib/features';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';

interface ProductPriceProps {
  price: number;
  compareAt?: number;
  pricing?: IFindify.PricingStructure;
  className?: string;
  showSalePrice?: boolean;
  // For simple pricing structure
  customFields?: Record<string, string[] | string>;
}

interface PriceCalculation {
  price: number;
  sale_price: number | null;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
  price,
  compareAt,
  pricing,
  className = 'flex h-5 flex-col text-xs uppercase tracking-wide lg:text-sm',
  showSalePrice = true,
  customFields,
}) => {
  const { store } = useCart();
  const { marketCode, country, currency } = useMarket();
  const { getStoreGroupIdFromLocalStorage } = useCart();
  const storeGroupId = useMemo(() => getStoreGroupIdFromLocalStorage(), [getStoreGroupIdFromLocalStorage]);
  const isSimplePricing = useSimplePricing();

  // Use currency from market hook
  const currencyCode = currency || store?.currencyCode || 'EUR';

  const productPrice = useMemo(() => {
    try {
      // Use simple pricing structure if enabled
      if (isSimplePricing && customFields) {
        // Use country from market hook for pricing
        const priceKey = getCurrencyPriceKey(country);
        const discountKey = getCurrencyDiscountKey(country);

        const priceValue = customFields[priceKey];
        const discountValue = customFields[discountKey];

        // If the currency-specific price doesn't exist, log error and use fallback
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

      // Access pricing data with proper typing
      const membershipPricing = pricing[membershipLevel];
      if (!membershipPricing || !membershipPricing[localeKey]) {
        console.warn(`Pricing data not found for membership level: ${membershipLevel} and locale: ${localeKey}`);
        return null;
      }
      return membershipPricing[localeKey];
    } catch (error) {
      console.error('Error calculating product price:', error);
      return null;
    }
  }, [pricing, storeGroupId, marketCode, isSimplePricing, customFields, price, country]);

  const priceCalculation = useMemo<PriceCalculation>(() => {
    try {
      if (productPrice?.price && productPrice?.sale_price && productPrice?.price > productPrice?.sale_price) {
        return { price: productPrice.price, sale_price: productPrice.sale_price };
      } else if (productPrice?.price) {
        // Use the locale-specific price from productPrice when available
        return { price: productPrice.price, sale_price: null };
      } else if (compareAt && compareAt > price) {
        return { price: compareAt, sale_price: price };
      } else {
        return { price: price || 0, sale_price: null };
      }
    } catch (error) {
      console.error('Error calculating sale price:', error);
      return { price: price || 0, sale_price: null };
    }
  }, [compareAt, productPrice, price]);

  const { price: regularPrice, sale_price } = priceCalculation;
  const hasDiscount = showSalePrice && sale_price !== null;

  // Format the price amount without currency symbol
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(marketCode === 'se' ? 'sv-SE' : marketCode === 'fi' ? 'fi-FI' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <span className={className}>
      <span className={hasDiscount ? 'text-red' : 'text-black'}>
        {formatPrice(hasDiscount ? sale_price : regularPrice)} {currencyCode}
      </span>
      {hasDiscount && (
        <span className={'ml-2 text-secondary line-through'}>
          {formatPrice(regularPrice)} {currencyCode}
        </span>
      )}
    </span>
  );
};
