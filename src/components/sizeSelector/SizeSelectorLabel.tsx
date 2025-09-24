import ChevronRight from '@images/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getVariantSelectionKey } from '@/src/util/pdpTemplate';
import SizeSelectorModal from './SizeSelectorModal';

export interface ISizeSelectorLabelProps {
  variants: IProductVariant[];
  selectedVariantSku: string | undefined;
  setSelectedVariantSku: (variantId: string) => void;
  selectedVariantByUser: string | undefined;
  setSelectedVariantByUser: (variantId: string) => void;
  className?: string;
  product?: IProduct;
  elasticData?: IElasticSearch.Item;
}

const SizeSelectorLabel: React.FC<ISizeSelectorLabelProps> = (props) => {
  const t = useTranslations('product-page');
  const [showModal, setShowModal] = useState<boolean>(false);

  // Find the selected variant to get its size (must be called before early return)
  const selectedVariant = useMemo(() => {
    if (!props.selectedVariantByUser) return null;
    return props.variants.find((v) => v.sku === props.selectedVariantByUser);
  }, [props.selectedVariantByUser, props.variants]);

  // Determine the appropriate default text based on template configuration (must be called before early return)
  const defaultTextKey = useMemo(() => getVariantSelectionKey(props.elasticData, 'choose-your'), [props.elasticData]);
  const defaultText = t(defaultTextKey);

  // Check if there are multiple sizes
  const hasMultipleSizes = props.variants.length > 1 && props.variants.some((variant) => variant.size);
  const hasAnySizes = props.variants.some((variant) => variant.size);

  // Don't render if no sizes or only one size (mobile behavior)
  if (!hasAnySizes || !hasMultipleSizes) return null;

  return (
    <div className={'order-5 mb-3 md:hidden'}>
      <div className={'flex items-center justify-between border border-gray-500 p-4'}>
        <span className={'w-full cursor-pointer text-sm uppercase'} onClick={() => setShowModal(true)}>
          {selectedVariant?.size || selectedVariant?.title || defaultText}
        </span>
        <ChevronRight className={'h-3 w-3 md:hidden'} />
      </div>
      <SizeSelectorModal
        isVisible={showModal}
        setIsVisible={setShowModal}
        props={props}
        product={props.product}
        elasticData={props.elasticData}
      />
    </div>
  );
};

export default SizeSelectorLabel;
