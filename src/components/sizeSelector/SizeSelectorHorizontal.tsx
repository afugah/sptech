import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import { StockDot } from '@/src/components/product/StockDot';
import { Tag } from '@/src/components/ui/TagList';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { evaluateStockRules, type StockRuleResult } from '@/src/util/stockRulesSimplified';
import { sortVariantsBySize } from '@/src/util/variants';

interface ISizeSelectorHorizontalProps {
  variants: IProductVariant[];
  selectedVariantSku: string | undefined;
  setSelectedVariantSku: (variantId: string) => void;
  selectedVariantByUser: string | undefined;
  setSelectedVariantByUser: (variantId: string) => void;
  withTitle?: boolean;
  className?: string;
  sizeGuideStory?: {
    content: CmsPage;
  };
  product?: IProduct;
  elasticData?: IElasticSearch.Item;
}

export const SizeSelectorHorizontal: React.FC<ISizeSelectorHorizontalProps> = (props) => {
  const {
    variants,
    selectedVariantSku,
    setSelectedVariantSku,
    selectedVariantByUser,
    setSelectedVariantByUser,
    className,
    withTitle = false,
    product,
    elasticData,
  } = props;
  const t = useTranslations('product-page');
  const sortedVariants = useMemo(() => sortVariantsBySize(variants), [variants]);

  // Show size selector even with 1 variant to display the available size
  // if (variants.length <= 1) return null;

  // const selectedVariant = variants.find((variant) => variant.sku === selectedVariantSku);
  // const selectedStockQuantity = selectedVariant?.stock?.quantity ?? 0;
  // const hasLowStock = selectedStockQuantity >= 6 && selectedStockQuantity <= 10;
  // const hasLowStockNumber = selectedStockQuantity <= 5;
  // const lowStock = variants.some((variant) => variant.stock?.quantity && variant.stock.quantity <= 10);

  const handleVariantClick = (variantSku: string, stockResult: StockRuleResult) => {
    if (stockResult.selectable) {
      setSelectedVariantSku(variantSku);
      setSelectedVariantByUser(variantSku); // Set the selected variant by user
    }
  };

  return (
    <div className={'order-9 md:order-6 '}>
      <div className={'mt-4 hidden flex-row gap-2 md:flex'}>
        <div className={'flex flex-row gap-3'}>
          {withTitle && <span className={'mt-1 text-xs uppercase'}>{t('product-page.size')}:</span>}
          <div className={'flex flex-col items-center gap-y-3'}>
            <div className={classNames('flex flex-row flex-wrap items-center gap-x-3 gap-y-3', className)}>
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
            {/* {lowStock && selectedVariantByUser && (
              <>
                {(hasLowStock || (hasLowStockNumber && !hasLowStock)) && (
                  <div className={'flex h-4 flex-row items-center gap-x-1 text-xs text-gray'}>
                    <div className={'flex flex-row items-center gap-x-1 text-xs text-gray'}>
                      <div className={`lex h-3 w-3 rounded-full ${hasLowStock ? 'bg-orange-600' : 'bg-red-600'}`}></div>
                      <span>=</span>
                      {hasLowStock
                        ? t('product-page.low-stock-warning')
                        : t('product-page.low-stock-only') +
                          ' ' +
                          selectedStockQuantity +
                          ' ' +
                          t('product-page.low-stock-left')}
                    </div>
                  </div>
                )}
              </>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};
