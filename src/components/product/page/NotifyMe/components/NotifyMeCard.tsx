import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

interface INotifyMeCard {
  product: IProduct;
  selectedVariantSku: string | undefined;
}

export const NotifyMeCard: React.FC<INotifyMeCard> = ({ product, selectedVariantSku }) => {
  const t = useTranslations();
  const { title, images } = product;

  const productSize = useMemo(() => {
    return product.variants.find((v) => v.sku === selectedVariantSku)?.variant;
  }, [product.variants, selectedVariantSku]);

  return (
    <div className={'flex items-center justify-center gap-x-5'}>
      <Image src={images[0]?.src} width={100} height={146} alt={title} />

      <div className={'flex w-full flex-col justify-between gap-y-2 text-sm'}>
        <div className={'flex justify-between'}>
          <div className={'font-sans text-sm'}>{title}</div>
        </div>

        <div>
          {t('product-page.size')}: {productSize}
        </div>
      </div>
    </div>
  );
};
