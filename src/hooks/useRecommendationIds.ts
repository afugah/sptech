import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { getMarketCode } from '@/src/util/locale';

interface IItem {
  drawerId?: string | null;
  listId?: string | null;
}

/**
 * Parse recommendation ids from `NEXT_PUBLIC_RECOMMENDATIONS` env.
 */
export const useRecommendationIds = (): IItem => {
  const locale = useLocale();
  const marketCode = useMemo(() => getMarketCode(locale)?.toLowerCase(), [locale]);

  const envStr = process.env.NEXT_PUBLIC_RECOMMENDATIONS;

  const result = useMemo(
    () =>
      envStr
        ?.split(';')
        .filter(Boolean)
        .map((item) => {
          const [market, drawerId, listId] = item.split(':');
          return {
            market: market.toLowerCase(),
            drawerId: drawerId || null,
            listId: listId || null,
          };
        })
        .find((item) => item.market === marketCode) ?? { drawerId: null, listId: null },
    [envStr, marketCode],
  );

  return result;
};
