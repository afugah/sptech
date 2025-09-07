import { startTransition, useCallback, useEffect, useState } from 'react';
import { useLocale } from 'use-intl';
import { useCart } from '@/src/context/cartContext';
import { useCheckout } from '@/src/context/checkoutContext';
import { useRouter } from '@/src/i18n/navigation';
import { availableCountries, getCurrencyForCountry } from '@/src/lib/constants/markets';
import { type IMarketSelectorHook, type MarketCode } from '@/src/types/market';
import { getMarketCode } from '@/src/util/locale';
import { getMarketByCountry, resolveCountryForMarket } from '@/src/util/market';

const STORAGE_KEY = 'selectedCountry';
const MANUAL_SELECTION_KEY = 'marketManuallySelected';

const getStoredCountry = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredCountry = (country: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, country);
  } catch {
    // Ignore localStorage errors
  }
};

export const useMarketSelector = (): IMarketSelectorHook => {
  const { updateStore } = useCart();
  const { clearCheckout } = useCheckout();
  const router = useRouter();
  const locale = useLocale();
  const currentMarket = getMarketCode(locale) as MarketCode;

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    const stored = getStoredCountry();
    return resolveCountryForMarket(currentMarket, stored || undefined);
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredCountry();
    const resolved = resolveCountryForMarket(currentMarket, stored || undefined);
    setSelectedCountry(resolved);
    setIsLoading(false);
  }, [currentMarket]);

  const handleCountrySelect = useCallback(
    (countryName: string) => {
      const targetMarket = getMarketByCountry(countryName);
      if (!targetMarket) return;

      setSelectedCountry(countryName);
      setStoredCountry(countryName);

      // Mark that user has manually selected a market
      // This prevents auto-detection from overriding user choice
      if (typeof window !== 'undefined') {
        localStorage.setItem(MANUAL_SELECTION_KEY, 'true');
      }

      // Get the currency for this country
      const currency = getCurrencyForCountry(countryName);

      // Only navigate if switching to/from Sweden or Finland
      // All other countries stay on the root path (en locale)
      if (targetMarket !== currentMarket) {
        startTransition(() => {
          router.replace('/', { locale: targetMarket });
        });
      }

      // Update the store with the correct currency for this country
      updateStore(countryName, currency);
      clearCheckout();
    },
    [currentMarket, router, updateStore, clearCheckout],
  );

  return {
    selectedCountry,
    availableCountries,
    handleCountrySelect,
    isLoading,
  };
};
