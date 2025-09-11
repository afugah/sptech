import { useLocale } from 'next-intl';
import { getCountryFromMarket, getCurrencyForCountry } from '@/src/lib/constants/markets';

/**
 * Hook to get the current market information from the URL
 * Returns market code, country name, and currency
 */
export function useMarket() {
  // useLocale now returns the market code (e.g., 'se', 'no', 'dk')
  const marketCode = useLocale();

  // Get country name from market code
  const country = getCountryFromMarket(marketCode);

  // Get currency for the country
  const currency = getCurrencyForCountry(country);

  return {
    marketCode,
    country,
    currency,
  };
}
