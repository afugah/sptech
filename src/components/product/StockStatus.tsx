import { useTranslations } from 'next-intl';
import React from 'react';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { evaluateStockRules } from '@/src/util/stockRulesSimplified';

// Debug logging removed - keeping calls for future debugging but silenced
const stockDebug = { log: (..._args: unknown[]) => {} };

interface StockStatusProps {
  selectedVariant: IProductVariant | undefined;
  product?: IProduct;
  elasticData?: IElasticSearch.Item;
  className?: string;
}

export const StockStatus: React.FC<StockStatusProps> = ({
  selectedVariant,
  product,
  elasticData,
  className: _className = '',
}) => {
  const t = useTranslations('product-page');

  const elasticVariant =
    selectedVariant && elasticData?.productVariants
      ? elasticData.productVariants.find((v) => v.sku === selectedVariant.sku)
      : undefined;

  // Debug: Log elastic variant matching details
  React.useEffect(() => {
    if (selectedVariant) {
      stockDebug.log('elasticVariantMatching', {
        selectedSku: selectedVariant.sku,
        hasElasticData: !!elasticData,
        hasProductVariants: !!elasticData?.productVariants,
        productVariantsCount: elasticData?.productVariants?.length || 0,
        elasticVariantFound: !!elasticVariant,
        elasticVariantSku: elasticVariant?.sku,
        availableSkus: elasticData?.productVariants?.map((v) => v.sku) || [],
      });

      // If found, log the structure
      if (elasticVariant) {
        stockDebug.log('elasticVariantStructure', {
          sku: elasticVariant.sku,
          hasAttributes: !!elasticVariant.attributes,
          attributeKeys: elasticVariant.attributes ? Object.keys(elasticVariant.attributes) : [],
          hasStockTypeVariant: !!elasticVariant.attributes?.stockTypeVariant,
          stockTypeVariantStructure: elasticVariant.attributes?.stockTypeVariant,
          stockTypeVariantValue: elasticVariant.attributes?.stockTypeVariant?.value,
        });
      }
    }
  }, [selectedVariant, elasticVariant, elasticData]);

  const stockResult = selectedVariant
    ? evaluateStockRules(selectedVariant, product, t, elasticVariant, elasticData)
    : null;

  React.useEffect(() => {
    if (selectedVariant && stockResult) {
      stockDebug.log('stockStatus', {
        hasSelectedVariant: !!selectedVariant,
        variantSku: selectedVariant?.sku,
        hasProductData: !!product,
        hasElasticData: !!elasticData,
        stockTypeVariant: elasticVariant?.attributes?.stockTypeVariant?.value?.['en'],
        status: stockResult.status,
        dotColor: stockResult.dotColor,
        rendering: !!stockResult.status,
      });
    }
  }, [selectedVariant, product, stockResult, elasticData, elasticVariant]);

  if (!selectedVariant || !stockResult?.status) {
    return null;
  }

  // return (
  //   <div className={className}>
  //     <div className={'mt-2 flex items-center gap-1.5 text-sm md:mt-0'}>
  //       <StockDot dotColor={stockResult.dotColor} />
  //       {stockResult.status}
  //     </div>
  //     {/* Debug info showing which rule was applied */}
  //     {isStockRulesEnabled() && stockResult.ruleName && (
  //       <div className={'mt-1 italic text-gray-300 text-xxs'}>[{stockResult.ruleName}]</div>
  //     )}
  //   </div>
  // );
};

export default StockStatus;
