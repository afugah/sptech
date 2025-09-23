'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'use-intl';
import { type IStock } from '../utils';
import { StockAvailability } from './StockAvailability';

interface IAvailableStock {
  stocks: IStock[];
  search: string;
  selectedVariant: string;
}

export const AvailableStock: React.FC<IAvailableStock> = ({ stocks, search, selectedVariant }) => {
  const t = useTranslations();
  const locale = useLocale();

  if (!stocks.length) {
    return <div className={'text-center text-sm text-gray'}>No stock available for this product</div>;
  }

  const displayedStock =
    stocks?.filter(
      ({ warehouseInfo, size }) =>
        warehouseInfo?.country?.toLowerCase() === locale &&
        (warehouseInfo?.title?.toLowerCase().includes(search.toLowerCase()) ||
          warehouseInfo?.city?.toLowerCase().includes(search.toLowerCase())) &&
        (!selectedVariant || size.some(({ size }) => size.toLowerCase() === selectedVariant.toLowerCase())),
    ) || [];

  return (
    <div>
      {[...displayedStock]
        .sort((a, b) => (a.warehouseInfo?.title ?? '').localeCompare(b.warehouseInfo?.title ?? ''))
        .map((v) => {
          const inStock = v.size.filter((v) => v.stockQuantity >= 3);
          const fewLeft = v.size.filter((v) => v.stockQuantity < 3 && v.stockQuantity !== 0);
          const outOfStock = v.size.filter((v) => v.stockQuantity === 0);
          const stockAvailability = [
            { title: t('common.in-stock'), data: inStock, className: 'bg-green-700' },
            { title: t('common.few-left'), data: fewLeft, className: 'bg-orange' },
            { title: t('common.out-of-stock'), data: outOfStock, className: 'bg-red' },
          ];

          return (
            <div key={v.name} className={'flex flex-col gap-y-2 border-b border-creme px-5 py-6'}>
              <div className={'flex justify-between text-base'}>
                <div>{v.warehouseInfo?.title}</div>
                <div className={'text-sm text-gray'}>{v.warehouseInfo?.city}</div>
              </div>

              {stockAvailability.map((props, index) => (
                <StockAvailability key={index} {...props} displaySize={v.size.length > 1} />
              ))}
            </div>
          );
        })}
    </div>
  );
};
