import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { StockDot } from '@/src/components/product/StockDot';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getVariantSelectionKey } from '@/src/util/pdpTemplate';
import { evaluateStockRules, type StockRuleResult } from '@/src/util/stockRulesSimplified';
import { sortVariantsBySize } from '@/src/util/variants';
import ProductModal from '../product/page/ProductModal';
import { Tag } from '../ui/TagList';
import { type ISizeSelectorLabelProps } from './SizeSelectorLabel';

interface SizeSelectorModalProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  props: ISizeSelectorLabelProps;
  product?: IProduct;
  elasticData?: IElasticSearch.Item;
}

const SizeSelectorModal: React.FC<SizeSelectorModalProps> = ({
  isVisible,
  setIsVisible,
  props,
  product,
  elasticData,
}) => {
  const t = useTranslations('product-page');
  const { variants, selectedVariantSku, setSelectedVariantSku, selectedVariantByUser, setSelectedVariantByUser } =
    props;

  const sortedVariants = useMemo(() => sortVariantsBySize(variants), [variants]);

  // State to track the stock status text when a size is selected
  const [selectedStockStatus, setSelectedStockStatus] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Determine the appropriate title based on template configuration
  const modalTitleKey = useMemo(() => getVariantSelectionKey(elasticData, 'choose-your'), [elasticData]);
  const defaultModalTitle = t(modalTitleKey);

  // Use stock status as title if a size was just selected, otherwise use default title
  const modalTitle = selectedStockStatus || defaultModalTitle;

  // Reset state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setSelectedStockStatus(null);
      setIsClosing(false);
    }
  }, [isVisible]);

  // Handle the delayed close
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        setSelectedStockStatus(null);
      }, 4000); // 4 second delay

      return () => clearTimeout(timer);
    }
  }, [isClosing, setIsVisible]);

  if (variants.length <= 1) return null;

  const handleVariantClick = (variantSku: string, stockResult: StockRuleResult) => {
    if (stockResult.selectable) {
      setSelectedVariantSku(variantSku);
      setSelectedVariantByUser(variantSku); // Set the selected variant by user
      setSelectedStockStatus(stockResult.status); // Set the stock status text as the title
      setIsClosing(true); // Start the closing process with delay
    }
  };

  return (
    <ProductModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      title={modalTitle}
      titleClassName={selectedStockStatus ? 'text-xs' : undefined}
    >
      <div className={'mb-6'}>
        <div className={'flex flex-col items-center gap-y-3'}>
          <div className={classNames('flex flex-row flex-wrap items-center gap-x-3 gap-y-3')}>
            {sortedVariants.map((variant, index) => {
              // Find the elastic variant that matches the current variant
              const elasticVariant = elasticData?.productVariants?.find((v) => v.sku === variant.sku);
              // Evaluate stock rules for this variant
              const stockResult = evaluateStockRules(variant, product, t, elasticVariant, elasticData);

              if (!variant.size) return null;

              return (
                <div key={`${variant.sku}-${index}`} className={'relative'}>
                  <Tag
                    lowStock={false}
                    lowStockNumber={false}
                    onClick={() => handleVariantClick(variant.sku, stockResult)}
                    className={classNames(
                      'relative !min-w-12 border border-black bg-white !px-2.5 text-center text-xs font-normal !text-black',
                      {
                        '!bg-creme !bg-opacity-30':
                          variant.sku === selectedVariantSku && variant.sku === selectedVariantByUser,
                        'cursor-not-allowed': !stockResult.selectable,
                      },
                    )}
                    style={{ opacity: stockResult.opacity || 1 }}
                  >
                    {variant.size}
                    {/* Diagonal line for non-purchasable out-of-stock variants */}
                    {!stockResult.allowPurchase && (
                      <div
                        className={'pointer-events-none absolute inset-0 z-10'}
                        style={{
                          background:
                            'linear-gradient(to top right, transparent calc(50% - 1px), #949494 calc(50% - 0.5px), #949494 calc(50% + 0.5px), transparent calc(50% + 1px))',
                        }}
                      />
                    )}
                  </Tag>
                  {/* Stock status dot indicator - only show on selected variant */}
                  {stockResult.dotColor && variant.sku === selectedVariantSku && (
                    <StockDot dotColor={stockResult.dotColor} className={'absolute right-1 top-1 z-10'} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ProductModal>
  );
};

export default SizeSelectorModal;
