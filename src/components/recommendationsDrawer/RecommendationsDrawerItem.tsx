'use client';

import Image from 'next/image';
import { useLocale } from 'use-intl';
import { useCart } from '@/src/context/cartContext';
import { useRecommendationsDrawer } from '@/src/context/recommendationsDrawerContext';
import { getAmount } from '@/src/helpers/money';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

interface IRecommendationDrawerItemProps {
  item: ICollectionItem;
}

export const RecommendationsDrawerItem: React.FC<IRecommendationDrawerItemProps> = (props) => {
  const { item } = props;
  const { slug, thumbnail, price, salePrice, display_name, title } = item;

  const { setIsRecMenuOpen } = useRecommendationsDrawer();
  const locale = useLocale();

  const { store } = useCart();
  const { currencyCode } = store || {};

  const hasSalePrice = !!salePrice && salePrice < price;

  return (
    <div className={'border-b border-creme px-16 pb-5 transition-shadow hover:shadow'}>
      <Link className={'flex gap-5'} href={`${slug}`} onClick={() => setIsRecMenuOpen(false)}>
        <Image src={thumbnail.url} alt={display_name} unoptimized width={100} height={150} className={'h-40 w-auto'} />

        <div className={'flex flex-1 flex-col justify-center'}>
          <div className={'font-sm truncate font-sans'}>{display_name}</div>
          <span className={'mb-1 text-xs uppercase text-secondary'}>{title.split(' ')[0]}</span>
          <div className={'flex flex-row gap-5'}>
            <span className={hasSalePrice ? 'text-red-500' : 'text-black'}>
              {getAmount(price * 100, currencyCode, locale)}
            </span>

            {hasSalePrice && (
              <span className={'ml-2 text-secondary line-through'}>
                {getAmount(salePrice * 100, currencyCode, locale)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
