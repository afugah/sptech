import ChevronRight from '@images/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import ProductFactsModal from './page/ProductFactsModal';

interface IProductFactsProps {
  product?: IProduct;
  story?: {
    content: CmsPage;
  };
}

export const ProductFacts: React.FC<IProductFactsProps> = (props) => {
  const t = useTranslations();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { story } = props;

  return (
    <div className={'order-10 md:order-8'}>
      <div className={'cursor-pointer [&>div]:my-2'} onClick={() => setShowModal(true)}>
        <div className={'my-4 w-full border-b border-gray-400'} />
        <div className={'flex items-center justify-between'}>
          <span className={'text-xs font-medium uppercase'}>{t('product-page.info.diamond-facts')}</span>
          <ChevronRight className={'h-3 w-3 md:hidden'} />
        </div>
        <div className={'my-4 w-full border-b border-gray-400'} />
      </div>
      <ProductFactsModal story={story} isVisible={showModal} setIsVisible={setShowModal} />
    </div>
  );
};

export default ProductFacts;
