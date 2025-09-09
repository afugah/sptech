import React from 'react';
import { type ProductDataSource } from '@/src/hooks/useProductDataWithFallback';

interface ProductSourceLabelProps {
  source: ProductDataSource;
  className?: string;
}

const sourceLabels: Record<ProductDataSource, { text: string; color: string }> = {
  findify: { text: 'Findify', color: 'bg-green-100 text-green-800 border-green-200' },
  elastic: { text: 'Elastic', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  typesense: { text: 'Typesense', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  storyblok: { text: 'Storyblok', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  none: { text: 'No Data', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

/**
 * Small label component to indicate the data source for a product
 * Only renders when NEXT_PUBLIC_SHOW_DEV_DEBUG_INFO is set to 'true'
 */
export const ProductSourceLabel: React.FC<ProductSourceLabelProps> = ({ source, className = '' }) => {
  // Only show debug label when explicitly enabled
  if (process.env.NEXT_PUBLIC_SHOW_DEV_DEBUG_INFO !== 'true') {
    return null;
  }

  const { text, color } = sourceLabels[source];

  return (
    <span
      className={`absolute bottom-1 left-1 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium opacity-10 ${color} ${className}`}
      title={`Product data sourced from ${text}`}
    >
      {text}
    </span>
  );
};
