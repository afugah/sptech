'use client';

import React from 'react';
import { type ElasticProduct, type LocalizedValue } from '@/src/types/product';
import { MaterialSelector } from './MaterialSelector';
import { ProductInfo } from './ProductInfo/ProductInfo';
import { ProductInfoTab } from './ProductInfo/Tab';

interface ProductMaterialSectionProps {
  product: ElasticProduct;
  locale: string;
  className?: string;
}

/**
 * Material Selection Section for Product Pages
 *
 * Integrates with the existing ProductInfo component structure
 * and displays material options when multiple materials are available
 * for the same product group.
 */
export const ProductMaterialSection: React.FC<ProductMaterialSectionProps> = ({ product, locale, className }) => {
  // Only render if product has multiple material variants
  if (!product.productGroupProducts || product.productGroupProducts.length <= 1) {
    return null;
  }

  return (
    <div className={className}>
      <ProductInfo>
        <ProductInfoTab
          id={'materials'}
          title={locale === 'sv' ? 'MATERIAL' : locale === 'fi' ? 'MATERIAALI' : 'MATERIAL'}
          data={{
            currentProduct: {
              id: product.id,
              product_sku: product.product_sku,
              material: {
                value:
                  product.attributes.material?.value &&
                  typeof product.attributes.material.value === 'object' &&
                  !Array.isArray(product.attributes.material.value)
                    ? (product.attributes.material.value as unknown as Record<string, string>)
                    : {},
                external_id: Array.isArray(product.attributes.material?.external_id)
                  ? product.attributes.material.external_id[0] || ''
                  : product.attributes.material?.external_id || '',
              },
            },
            productGroupProducts: product.productGroupProducts,
            locale,
          }}
        >
          {(data) => (
            <MaterialSelector
              currentProduct={data.currentProduct}
              productGroupProducts={data.productGroupProducts}
              locale={data.locale as keyof LocalizedValue}
            />
          )}
        </ProductInfoTab>
      </ProductInfo>
    </div>
  );
};

export default ProductMaterialSection;
