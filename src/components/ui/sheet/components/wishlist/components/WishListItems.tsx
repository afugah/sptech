'use client';
import classNames from 'classnames';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useLocale } from 'use-intl';
import { Button } from '@/src/components/shadcn/button';
import { useCart } from '@/src/context/cartContext';
import { getAmount } from '@/src/helpers/money';
import { useWishlist } from '@/src/hooks/useWishlist';
import { Link } from '@/src/i18n/navigation';
import { type ICollectionWishlistItem } from '@/src/lib/framework/Collection/domain/entities/ICollectionItem';

type Props = {
  item: ICollectionWishlistItem;
};

const WishListItem = ({ item }: Props) => {
  const { cart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const locale = useLocale();

  const t = useTranslations('wishlist');
  const { slug, thumbnail, description, title, price } = item;

  return (
    <div className={'space-y-2 border-b border-gray-400 pb-3 text-xs sm:gap-5'}>
      <div className={'mt-5 flex flex-row items-start gap-4'}>
        <div className={' border border-gray-300'}>
          <div>
            <Image src={thumbnail.url} alt={title} unoptimized width={100} height={150} />
          </div>
        </div>

        <div className={'flex w-3/4 flex-1 flex-col gap-5 pt-1'}>
          <div className={classNames('flex flex-col gap-1 truncate')}>
            <span className={'mb-2 truncate text-sm font-semibold uppercase text-black'}>{title}</span>
            <span className={' truncate text-xxs  text-black'}>{description}</span>
          </div>
        </div>
      </div>
      <div className={'flex flex-row items-center justify-between gap-1 pt-3'}>
        <div className={''}>
          <Button
            variant={'custom'}
            className={' px-1 [_&>svg]:size-[1.35rem]'}
            onClick={() => {
              removeFromWishlist(item.sku);
            }}
          >
            <Trash2 strokeWidth={1} className={'text-gray-700'} />
          </Button>
        </div>
        <div className={' flex items-center gap-4'}>
          <span className={'border-r-2 border-gray-700 px-2 pr-3 text-sm uppercase text-black/80 lg:text-md'}>
            {getAmount(price as number, cart?.currencyCode as string, locale)}
          </span>
          {/* <span className={'border-r-2 border-gray-700 px-2 pr-3 text-sm uppercase text-black/80 lg:text-md'}>
            {getAmount(item.salePrice!, cart?.currencyCode ?? '', locale)}
          </span> */}
          <Link className={'font-medium uppercase text-black underline hover:text-black'} href={slug}>
            {t('more-info')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishListItem;
