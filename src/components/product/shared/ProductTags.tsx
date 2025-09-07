'use client';

import React from 'react';
import { ProductTag } from '../ProductTag';

interface ProductTagsProps {
  tags?: unknown[];
  className?: string;
}

export const ProductTags: React.FC<ProductTagsProps> = ({
  tags,
  className = 'absolute top-2 z-10 w-auto space-y-1',
}) => {
  if (!tags?.length) return null;

  return (
    <div className={className}>
      {tags.map(
        (tag) => Array.isArray(tag) && tag.length > 0 && tag.map((t, index) => <ProductTag key={index} tag={t} />),
      )}
    </div>
  );
};
