import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/src/components/shadcn/button';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link } from '@/src/i18n/navigation';
import WishListItem from './WishListItems';

export function WishListHeader() {
  const { wishlistItems, wishlistCount } = useWishlist();
  const t = useTranslations('wishlist');
  return (
    <div className={'px-1'}>
      <div className={'flex items-center justify-between pt-4'}>
        <h2 className={' font-sans text-[0.8rem] font-light'}>
          {t('show-products', { count: wishlistCount, total: wishlistCount })}
        </h2>

        {wishlistItems.length > 0 && (
          <span className={'text-[0.7rem]'}>
            <Link href={'/wishlist'} className={'uppercase text-gray-900 hover:text-gray-700'}>
              {t('view-all')}
            </Link>
            <ArrowRight className={'ml-1 inline-block h-4 w-4'} strokeWidth={1} />
          </span>
        )}
      </div>
      <hr className={' mt-8 h-[0.08rem]'} />

      <div className={'w-full'}>
        {wishlistItems.length > 0 ? (
          <div className={'mx-0 mt-5 border-gray-300'}>
            {wishlistItems?.slice(0, 10).map((item) => <WishListItem key={item.id} item={item} />)}
          </div>
        ) : (
          // Empty cart
          <p className={'py-6 font-light'}>{t('no-items')}</p>
        )}
      </div>
      {wishlistItems.length > 0 && (
        <div className={'mt-8'}>
          <Link href={'/wishlist'} className={'   lg:px-0'}>
            <Button className={' w-full bg-gray-900 py-6 uppercase text-alabaster'} variant={'custom'}>
              {t('show-all')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
