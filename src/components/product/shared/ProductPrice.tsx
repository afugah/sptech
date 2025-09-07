'use client';

import { useLocale } from 'next-intl';
import React, { useMemo } from 'react';
import { useCart } from '@/src/context/cartContext';
import { getCurrencyDiscountKey, getCurrencyPriceKey, getCurrentCountry } from '@/src/lib/constants/markets';
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
  const locale = useLocale();
  const { getStoreGroupIdFromLocalStorage } = useCart();
  const storeGroupId = useMemo(() => getStoreGroupIdFromLocalStorage(), [getStoreGroupIdFromLocalStorage]);
  const isSimplePricing = useSimplePricing();

  // CRITICAL: Determine currency based on locale URL, NOT store/localStorage
  // This ensures /fi always shows EUR, /se always shows SEK
  const currencyCode = useMemo(() => {
    if (locale === 'fi') return 'EUR';
    if (locale === 'se') return 'SEK';
    if (locale === 'no') return 'NOK';
    // Default fallback (for 'en' or other locales)
    return store?.currencyCode || 'USD';
  }, [locale, store?.currencyCode]);

  const productPrice = useMemo(() => {
    try {
      // Use simple pricing structure if enabled
      if (isSimplePricing && customFields) {
        // ALWAYS use locale-based pricing, NEVER localStorage for price selection
        let country: string;

        if (locale === 'fi') {
          country = 'Finland';
        } else if (locale === 'se') {
          country = 'Sweden';
        } else if (locale === 'no') {
          country = 'Norway';
        } else {
          // Default for 'en' and other locales
          country = getCurrentCountry();
        }

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
      if (!pricing || !locale || !storeGroupId) return null;
      const membershipLevel = storeGroupId as IFindify.MembershipLevel;
      const localeKey = locale.toLocaleUpperCase() as IFindify.Locale;

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
  }, [pricing, storeGroupId, locale, isSimplePricing, customFields, price]);

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
    return new Intl.NumberFormat(locale === 'se' ? 'sv-SE' : locale === 'fi' ? 'fi-FI' : 'en-US', {
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
