'use client';

import React, { useState } from 'react';

interface ColorVariant {
  color: string;
  bgColor: string;
  title: string;
  hoverImageUrl?: string;
  productUrl?: string;
}

interface ColorVariantsProps {
  variants?: ColorVariant[];
  className?: string;
  onColorHover?: (variant: ColorVariant | null) => void;
  onColorClick?: (variant: ColorVariant) => void;
}

// Mock data for demonstration - will be replaced with real product color data
const defaultVariants: ColorVariant[] = [
  {
    color: 'orange',
    bgColor: 'bg-orange-500',
    title: 'Orange',
    hoverImageUrl: '/images/product-orange.jpg',
    productUrl: '/products/camera-orange',
  },
  {
    color: 'black',
    bgColor: 'bg-black',
    title: 'Black',
    hoverImageUrl: '/images/product-black.jpg',
    productUrl: '/products/camera-black',
  },
];

export const ColorVariants: React.FC<ColorVariantsProps> = ({
  variants = defaultVariants,
  className = 'flex gap-1 mt-3',
  onColorHover,
  onColorClick,
}) => {
  const [hoveredVariant, setHoveredVariant] = useState<ColorVariant | null>(null);

  const handleMouseEnter = (variant: ColorVariant) => {
    setHoveredVariant(variant);
    onColorHover?.(variant);
  };

  const handleMouseLeave = () => {
    setHoveredVariant(null);
    onColorHover?.(null);
  };

  const handleClick = (variant: ColorVariant) => {
    onColorClick?.(variant);
    if (variant.productUrl) {
      // Future implementation for navigation
      // Navigate to variant.productUrl
    }
  };

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {variants.map((variant, index) => (
        <div
          key={`${variant.color}-${index}`}
          className={`
            h-4 w-4 cursor-pointer rounded-full border border-gray-300 
            transition-transform duration-200 ease-in-out hover:scale-110
            ${variant.bgColor}
            ${hoveredVariant?.color === variant.color ? 'ring-2 ring-gray-400 ring-offset-1' : ''}
          `}
          title={variant.title}
          onMouseEnter={() => handleMouseEnter(variant)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(variant)}
          role={'button'}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(variant);
            }
          }}
          aria-label={`Select ${variant.title} color variant`}
        />
      ))}
    </div>
  );
};
