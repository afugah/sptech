'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { FreeShippingBanner } from '@/src/components/checkout/FreeShippingBanner';
import { RecommendationsDrawerItem } from '@/src/components/recommendationsDrawer/RecommendationsDrawerItem';
import { fetchRecommendedItems } from '@/src/components/recommendedList/actions';
import { Button } from '@/src/components/ui/Button';
import { useCart } from '@/src/context/cartContext';
import { useRecommendationsDrawer } from '@/src/context/recommendationsDrawerContext';
import { useMarketCode } from '@/src/hooks/useMarketCode';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';
import { Drawer } from '../ui/Drawer';
import Loader from '../ui/Loader';

interface IRecommendationsDrawer {
  itemId?: string;
  slot: string;
}

const RecommendationsDrawer: React.FC<IRecommendationsDrawer> = (props) => {
  const { itemId, slot } = props;
  const { isRecMenuOpen, setIsRecMenuOpen } = useRecommendationsDrawer();
  const { cart } = useCart();

  const [productList, setProductList] = useState<ICollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const marketCode = useMarketCode();
  useEffect(() => {
    setIsLoading(true);
    fetchRecommendedItems(marketCode, slot, itemId, 5)
      .then(setProductList)
      .finally(() => setIsLoading(false));
  }, [itemId, marketCode, slot]);

  const latestProduct = useMemo(() => {
    return cart?.items[cart?.items.length - 1] || null;
  }, [cart?.items]);

  const t = useTranslations('');

  return (
    <Drawer
      className={'relative p-0'}
      onClose={() => setIsRecMenuOpen(false)}
      open={isRecMenuOpen}
      title={t('cart.recommendations-title')}
      bodyClassName={'md:!gap-7'}
      header={(closeButton) => (
        <div className={'mb-7 w-full bg-creme'}>
          <div className={'contents [&>div]:bg-creme'}>{closeButton}</div>

          <div className={'mt-5 flex flex-col gap-5 px-16 pb-10'}>
            <div className={'flex flex-col text-center text-2xl'}>
              <p className={'mb-3 font-serif'}>{t('cart.added-to-cart')}</p>
              {!!latestProduct?.displayName && <p className={'text-sm'}>{latestProduct?.displayName}</p>}
            </div>

            <FreeShippingBanner />

            <Link href={'/checkout'} className={'w-full'} onClick={() => setIsRecMenuOpen(false)}>
              <Button buttonType={Button.Type.Filled} className={'w-full border-2 border-black text-black'}>
                {t('cart.go-to-checkout')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <div className={'space-y-4'}>
        {isLoading ? (
          <Loader />
        ) : (
          productList?.map((item) => {
            return <RecommendationsDrawerItem key={item.key} item={item} />;
          })
        )}
      </div>
    </Drawer>
  );
};

export default RecommendationsDrawer;
