import EyeIcon from '@images/icons/eye.svg';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useWishlist } from '@/src/hooks/useWishlist';
import { isWishlistEnabled } from '@/src/lib/features';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { Button } from '../shadcn/button';
import DropAHintModal from './page/DropAHintModal';

interface IProductEngagementProps {
  product: IProduct;
}

export const ProductEngagement: React.FC<IProductEngagementProps> = ({ product }) => {
  const t = useTranslations();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  return (
    <div className={'order-8 my-3 -ml-4 flex flex-row justify-between md:mb-0 md:flex-col'}>
      {isWishlistEnabled() && (
        <div>
          <Button
            variant={'custom'}
            onClick={() =>
              toggleWishlist({
                sku: product.sku,
                id: product.id,
                title: product.title,
                display_name: product.display_name,
                thumbnail: {
                  url: product.thumbnail.url,
                  hoverUrl: product.images[1]?.src || product.images[3]?.src,
                },
                description: product.description,
                slug: product.slug,
                price: product.variants[0].price?.basePriceAmount,
                tags: [''],
              })
            }
            aria-label={'Add to wishlist'}
            type={'button'}
            className={'flex [&_svg]:size-5'}
          >
            <Heart
              className={`mr-1 ${isInWishlist(product.sku) ? ' fill-backgroundAlternative stroke-backgroundAlternative ' : 'stroke-backgroundAlternative'}`}
              size={16}
              strokeWidth={1}
            />
            <span className={'text-xs uppercase text-gray-800'}>{t('product-page.info.add-to-wishlist')}</span>
          </Button>
        </div>
      )}
      <div>
        <Button
          variant={'custom'}
          aria-label={'Drop a hint'}
          type={'button'}
          className={'flex items-center'}
          onClick={() => setShowModal(true)}
        >
          <EyeIcon className={'h-6 w-6 stroke-creme'} />
          <span className={'ml-2 text-xs uppercase text-gray-800'}>Drop a hint</span>
        </Button>
      </div>
      <DropAHintModal product={product} isVisible={showModal} setIsVisible={setShowModal} />
    </div>
  );
};

export default ProductEngagement;
