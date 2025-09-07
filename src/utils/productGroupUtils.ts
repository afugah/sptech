import { type ElasticProduct, type ProductGroupProduct } from '@/src/types/product';

/**
 * Utilities to understand and work with Product Groups in Elastic data
 *
 * Product Groups connect different materials/variants of the same design:
 * - product_group_identifier: "13-01824" (same for all materials)
 * - productGroupProducts: Array of all material variants
 * - Each material has different SKU: 13-101-01824 (Gold), 13-102-01824 (White Gold)
 */

export interface ProductGroupInfo {
  groupIdentifier: string;
  currentProduct: {
    id: number;
    sku: string;
    material: string;
  };
  availableVariants: Array<{
    id: number;
    sku: string;
    material: string;
    slug: string;
    isActive: boolean;
    stockSum: number;
  }>;
  totalVariants: number;
}

/**
 * Analyze a product and its group relationships
 */
export function analyzeProductGroup(product: ElasticProduct): ProductGroupInfo {
  const groupIdentifier = product.product_group_identifier;

  // Determine current product's material
  let currentMaterial = 'UNKNOWN';
  if (product.product_sku.includes('-101-')) currentMaterial = 'GULD';
  else if (product.product_sku.includes('-102-')) currentMaterial = 'VITGULD';
  else if (product.product_sku.includes('-103-')) currentMaterial = 'SILVER';

  const availableVariants =
    product.productGroupProducts?.map((variant) => {
      let variantMaterial = 'UNKNOWN';
      if (variant.product_sku.includes('-101-')) variantMaterial = 'GULD';
      else if (variant.product_sku.includes('-102-')) variantMaterial = 'VITGULD';
      else if (variant.product_sku.includes('-103-')) variantMaterial = 'SILVER';

      return {
        id: variant.id,
        sku: variant.product_sku,
        material: variantMaterial,
        slug: variant.slug.en || variant.slug.sv || '',
        isActive: variant.status === 'ACTIVE',
        stockSum: variant.stockSum,
      };
    }) || [];

  return {
    groupIdentifier,
    currentProduct: {
      id: product.id,
      sku: product.product_sku,
      material: currentMaterial,
    },
    availableVariants,
    totalVariants: availableVariants.length,
  };
}

/**
 * Get material variants that are different from current product
 */
export function getAlternativeMaterials(product: ElasticProduct): ProductGroupProduct[] {
  const currentSku = product.product_sku;

  return product.productGroupProducts?.filter((variant) => variant.product_sku !== currentSku) || [];
}

/**
 * Check if a product has multiple material options
 */
export function hasMultipleMaterials(product: ElasticProduct): boolean {
  return (product.productGroupProducts?.length || 0) > 1;
}

/**
 * Find specific material variant in product group
 */
export function findMaterialVariant(
  product: ElasticProduct,
  materialId: 'GULD' | 'VITGULD' | 'SILVER',
): ProductGroupProduct | null {
  if (!product.productGroupProducts) return null;

  const skuPattern = materialId === 'GULD' ? '-101-' : materialId === 'VITGULD' ? '-102-' : '-103-';

  return product.productGroupProducts.find((variant) => variant.product_sku.includes(skuPattern)) || null;
}

/**
 * Debug function to log product group structure
 */
export function debugProductGroup(product: ElasticProduct): void {
  analyzeProductGroup(product);
}
