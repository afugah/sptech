import { useLocale } from 'next-intl';
import { getMarketCode } from '@/src/util/locale';

export const useMarketCode = () => {
  const locale = useLocale();

  return getMarketCode(locale);
};
