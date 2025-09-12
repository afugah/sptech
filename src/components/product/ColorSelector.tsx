'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { type ProductGroupProduct } from '@/src/types/product';

interface ColorSelectorProps {
  productGroupProducts?: ProductGroupProduct[];
  currentProductId: string | number;
  onImageHover?: (imageUrl: string | null) => void;
  className?: string;
}

export function ColorSelector({ productGroupProducts, currentProductId, onImageHover, className }: ColorSelectorProps) {
  const router = useRouter();
  const [hoveredProductId, setHoveredProductId] = useState<string | number | null>(null);

  // Filter out current product and products without valid URLs
  const validProducts = productGroupProducts?.filter(
    (product) => String(product.id) !== String(currentProductId) && product.productUrl,
  );

  // Don't show selector if there are no other products to switch to
  if (!validProducts || validProducts.length === 0) {
    return null;
  }

  // Include current product in display list but filtered list determines visibility
  const displayProducts = productGroupProducts || [];

  const handleColorClick = (product: ProductGroupProduct) => {
    // Only navigate if it's not the current product and has a valid URL
    if (String(product.id) !== String(currentProductId) && product.productUrl) {
      router.push(product.productUrl);
    }
  };

  const handleColorHover = (product: ProductGroupProduct | null) => {
    if (product) {
      setHoveredProductId(product.id);
      // Call the image hover callback if provided
      if (onImageHover && (product.imageUrl || product.image)) {
        onImageHover(product.imageUrl || product.image || null);
      }
    } else {
      setHoveredProductId(null);
      if (onImageHover) {
        onImageHover(null);
      }
    }
  };

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <span className={'text-sm font-medium text-gray-700'}>Colors:</span>
      <div className={'flex gap-1.5'}>
        {displayProducts.map((product) => {
          const isSelected = String(product.id) === String(currentProductId);
          const isHovered = String(product.id) === String(hoveredProductId);
          const productTitle = typeof product.title === 'string' ? product.title : product.title?.en || '';

          // Use color property if available, otherwise try to extract from title or use default
          const colorName = product.color || productTitle || 'Color';
          const imageUrl = product.imageUrl || product.image || '';

          return (
            <button
              key={product.id}
              onClick={() => handleColorClick(product)}
              onMouseEnter={() => handleColorHover(product)}
              onMouseLeave={() => handleColorHover(null)}
              disabled={isSelected}
              className={classNames('group relative h-10 w-10 rounded-full border-2 transition-all duration-200', {
                'border-black shadow-lg': isSelected,
                'border-gray-300 hover:border-gray-500': !isSelected,
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2': !isSelected,
                'ring-2 ring-black ring-offset-2': isHovered && !isSelected,
                'cursor-default': isSelected,
                'cursor-pointer': !isSelected,
              })}
              aria-label={`Select ${colorName} color`}
              aria-pressed={isSelected}
              aria-current={isSelected ? 'true' : undefined}
            >
              {imageUrl ? (
                // Show product thumbnail if available
                <div className={'relative h-full w-full overflow-hidden rounded-full'}>
                  <Image src={imageUrl} alt={colorName} fill className={'object-cover'} sizes={'40px'} />
                </div>
              ) : (
                // Fallback to color swatch based on color name or a gradient
                <div className={classNames('h-full w-full rounded-full', getColorClassByName(colorName))} />
              )}

              {/* Tooltip */}
              <span
                className={classNames(
                  'absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap',
                  'rounded bg-gray-900 px-2 py-1 text-xs text-white',
                  'opacity-0 transition-opacity duration-200',
                  'pointer-events-none z-10',
                  {
                    'group-hover:opacity-100': !isSelected,
                  },
                )}
              >
                {colorName}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <div className={'absolute inset-0 flex items-center justify-center'}>
                  <div className={'h-2 w-2 rounded-full bg-white shadow-sm'} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get Tailwind color class based on color name
function getColorClassByName(colorName: string): string {
  const name = colorName.toLowerCase();

  const colorMap: Record<string, string> = {
    black: 'bg-black',
    white: 'bg-white border border-gray-300',
    gray: 'bg-gray-500',
    grey: 'bg-gray-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    brown: 'bg-amber-700',
    navy: 'bg-blue-900',
    beige: 'bg-amber-100',
    gold: 'bg-yellow-600',
    silver: 'bg-gray-400',
  };

  return colorMap[name] || 'bg-gradient-to-br from-gray-300 to-gray-500';
}
