'use client';

import classNames from 'classnames';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { type LocalizedValue, type ProductGroupProduct } from '@/src/types/product';
import { type ColorVariant, getColorVariantsFromGroup, getCurrentProductColor } from '@/src/utils/colorVariantUtils';

interface ColorVariantSelectorProps {
  currentProduct: {
    id: string;
    sku: string;
    title: string;
  };
  productGroupProducts: ProductGroupProduct[];
  locale: keyof LocalizedValue;
  className?: string;
}

export const ColorVariantSelector: React.FC<ColorVariantSelectorProps> = ({
  currentProduct,
  productGroupProducts,
  locale,
  className,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get color variants using utility function
  const availableColors = React.useMemo(() => {
    return getColorVariantsFromGroup(productGroupProducts, locale);
  }, [productGroupProducts, locale]);

  const handleColorChange = useCallback(
    async (selectedColor: ColorVariant) => {
      if (selectedColor.sku === currentProduct.sku) {
        return; // Already selected
      }

      setIsLoading(true);

      try {
        if (selectedColor.productUrl) {
          router.push(selectedColor.productUrl);
        }
      } catch (error) {
        console.error('Error navigating to color variant:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentProduct.sku, router],
  );

  // Don't render if only one color available or no colors
  if (availableColors.length <= 1) {
    return null;
  }

  // Get current product color info
  const currentColorInfo = getCurrentProductColor(currentProduct.sku, productGroupProducts, locale);
  const currentColorName = currentColorInfo?.colorName || '';

  return (
    <div className={classNames('color-variant-selector', className)}>
      {/* Display current color name without "COLOR:" prefix */}
      {currentColorName && <div className={'mb-3 text-sm font-medium text-gray-900'}>{currentColorName}</div>}
      <div className={'flex flex-row flex-wrap gap-3'}>
        {availableColors.map((colorVariant) => {
          const isSelected = colorVariant.sku === currentProduct.sku;
          const colorName = colorVariant.color || colorVariant.title || 'Unknown';

          return (
            <button
              key={colorVariant.sku}
              onClick={() => handleColorChange(colorVariant)}
              disabled={isLoading}
              className={classNames('group relative transition-all duration-200', {
                'cursor-not-allowed opacity-50': isLoading,
              })}
              title={colorName}
            >
              {/* Product image with border indicating selection */}
              <div
                className={classNames('relative h-[80px] w-[60px] overflow-hidden transition-all duration-200', {
                  'border border-black': isSelected,
                  '': !isSelected,
                })}
              >
                {colorVariant.imageUrl ? (
                  <Image src={colorVariant.imageUrl} alt={colorName} fill className={'object-contain'} sizes={'80px'} />
                ) : (
                  // Fallback for missing images - show a placeholder with color info
                  <div className={'flex h-full w-full items-center justify-center text-xs text-gray-500'}>
                    {colorVariant.color ? colorVariant.color.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorVariantSelector;
