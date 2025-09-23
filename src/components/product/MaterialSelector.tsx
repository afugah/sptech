'use client';

import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { type LocalizedValue, type ProductGroupProduct } from '@/src/types/product';
import { getMaterialVariantsFromGroup } from '@/src/utils/materialUtils';

interface MaterialSelectorProps {
  currentProduct: {
    id: number;
    product_sku: string;
    material: {
      value: Record<string, string>;
      external_id: string;
    };
  };
  productGroupProducts: ProductGroupProduct[];
  locale: keyof LocalizedValue;
  className?: string;
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  currentProduct,
  productGroupProducts,
  locale,
  className,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique materials from productGroupProducts - these are already grouped by design
  const availableMaterials = React.useMemo(() => {
    return getMaterialVariantsFromGroup(productGroupProducts);
  }, [productGroupProducts]);

  const handleMaterialChange = useCallback(
    async (selectedMaterial: ProductGroupProduct) => {
      if (selectedMaterial.product_sku === currentProduct.product_sku) {
        return; // Already selected
      }

      setIsLoading(true);

      try {
        const targetSlug = selectedMaterial.fullSlug[locale] || selectedMaterial.fullSlug.en;
        if (targetSlug) {
          router.push(targetSlug);
        }
      } catch (error) {
        console.error('Error navigating to material variant:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentProduct.product_sku, locale, router],
  );

  // Don't render if only one material available
  if (availableMaterials.length <= 1) {
    return null;
  }

  return (
    <div className={classNames('material-selector', className)}>
      <h3 className={'mb-4 font-sans text-sm uppercase text-gray-700'}>
        {locale === 'sv' ? 'MATERIAL' : locale === 'fi' ? 'MATERIAALI' : 'MATERIAL'}
      </h3>

      <div className={'flex flex-row flex-wrap gap-5'}>
        {availableMaterials.map((material) => {
          const isSelected = material.product_sku === currentProduct.product_sku;
          const displayName =
            material.material?.display_name?.[locale] ||
            material.material?.value?.[locale] ||
            material.material?.external_id;

          return (
            <button
              key={material.product_sku}
              onClick={() => handleMaterialChange(material)}
              disabled={isLoading}
              className={classNames('flex items-center gap-2 text-left transition-all duration-200', {
                'cursor-not-allowed opacity-50': isLoading,
              })}
              title={displayName}
            >
              {/* Checkbox-style indicator */}
              <div
                className={classNames('h-7 w-7 border transition-all duration-200', {
                  'border-creme bg-creme': isSelected,
                  'border-creme bg-white hover:bg-creme-200': !isSelected,
                })}
              >
                {isSelected && (
                  <div className={'flex h-full w-full items-center justify-center'}>
                    <svg className={'h-5 w-5 text-white'} fill={'currentColor'} viewBox={'0 0 20 20'}>
                      <path
                        fillRule={'evenodd'}
                        d={
                          'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        }
                        clipRule={'evenodd'}
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Material name */}
              <span className={'text-nowrap text-sm font-medium uppercase text-gray-900'}>{displayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialSelector;
