import { type ElasticProduct, type LocalizedValue, type ProductGroupProduct } from '@/src/types/product';

// Material mapping for display names
export const MATERIAL_DISPLAY_NAMES: Record<string, LocalizedValue> = {
  GULD: { en: 'GOLD', sv: 'GULD', fi: 'KULTAA' },
  VITGULD: { en: 'WHITE GOLD', sv: 'VITGULD', fi: 'VALKOKULTAA' },
  SILVER: { en: 'SILVER', sv: 'SILVER', fi: 'HOPEAA' },
  ROSEGULD: { en: 'ROSE GOLD', sv: 'ROSÉGULD', fi: 'RUUSUKULTAA' },
};

/**
 * Extract material ID from product SKU or slug
 * Based on common patterns in SP Tech product codes
 */
export function extractMaterialFromProduct(product: ProductGroupProduct): string | null {
  // Check if material is directly available
  if (product.material?.external_id) {
    return product.material.external_id;
  }

  // Pattern matching based on SKU - check if SKU exists first
  const sku = product.product_sku;

  if (sku) {
    // Pattern: 13-101-XXXXX = Gold, 13-102-XXXXX = White Gold, 13-103-XXXXX = Silver
    if (sku.includes('-102-') || sku.includes('white-gold')) {
      return 'VITGULD';
    }
    if (sku.includes('-101-') || (sku.includes('-gold') && !sku.includes('white-gold'))) {
      return 'GULD';
    }
    if (sku.includes('-103-') || sku.includes('silver')) {
      return 'SILVER';
    }
    if (sku.includes('-104-') || sku.includes('rose-gold')) {
      return 'ROSEGULD';
    }
  }

  // Fallback to slug analysis - check if slug exists first
  const slug = product.slug?.en || product.slug?.sv || '';
  if (slug) {
    if (slug.includes('white-gold')) return 'VITGULD';
    if (slug.includes('rose-gold')) return 'ROSEGULD';
    if (slug.includes('gold')) return 'GULD';
    if (slug.includes('silver')) return 'SILVER';
  }

  return null;
}

/**
 * Get display name for material in given locale
 */
export function getMaterialDisplayName(materialId: string, locale: keyof LocalizedValue): string {
  return MATERIAL_DISPLAY_NAMES[materialId]?.[locale] || materialId;
}

/**
 * Check if a product is available/in stock
 */
export function isProductAvailable(product: ProductGroupProduct): boolean {
  // Check explicit availability if provided
  if (product.availability) {
    return product.availability.inStock && product.availability.stockSum > 0;
  }

  // Fallback to status and stock sum
  return product.status === 'ACTIVE' && product.stockSum > 0;
}

/**
 * Transform Elastic product data for MaterialSelector
 * Uses productGroupProducts which contains all material variants of the same design
 */
export function prepareMaterialSelectorData(product: ElasticProduct) {
  const materialsMap = new Map<string, ProductGroupProduct>();

  // Process all products in the group - these are different materials of the same design
  product.productGroupProducts?.forEach((groupProduct) => {
    const materialId = extractMaterialFromProduct(groupProduct);

    if (materialId && !materialsMap.has(materialId)) {
      // Enhance the product with material information
      const enhancedProduct: ProductGroupProduct = {
        ...groupProduct,
        material: {
          value: MATERIAL_DISPLAY_NAMES[materialId] || {
            en: materialId,
            sv: materialId,
            fi: materialId,
          },
          external_id: materialId,
          display_name: MATERIAL_DISPLAY_NAMES[materialId],
        },
        availability: {
          inStock: groupProduct.status === 'ACTIVE',
          stockSum: groupProduct.stockSum,
        },
      };

      materialsMap.set(materialId, enhancedProduct);
    }
  });

  return Array.from(materialsMap.values());
}

/**
 * Get all material variants from productGroupProducts
 * This is the main function to use - productGroupProducts already contains the grouped materials
 */
export function getMaterialVariantsFromGroup(productGroupProducts: ProductGroupProduct[]): ProductGroupProduct[] {
  const materialsMap = new Map<string, ProductGroupProduct>();

  productGroupProducts.forEach((groupProduct) => {
    const materialId = extractMaterialFromProduct(groupProduct);

    if (materialId) {
      // Only add unique materials (in case there are duplicates)
      if (!materialsMap.has(materialId)) {
        const enhancedProduct: ProductGroupProduct = {
          ...groupProduct,
          material: {
            value: MATERIAL_DISPLAY_NAMES[materialId] || {
              en: materialId,
              sv: materialId,
              fi: materialId,
            },
            external_id: materialId,
            display_name: MATERIAL_DISPLAY_NAMES[materialId],
          },
          availability: {
            inStock: groupProduct.status === 'ACTIVE',
            stockSum: groupProduct.stockSum,
          },
        };

        materialsMap.set(materialId, enhancedProduct);
      }
    }
  });

  return Array.from(materialsMap.values());
}

/**
 * Get current product's material ID
 */
export function getCurrentProductMaterial(product: ElasticProduct): string | null {
  if (product.attributes.material?.external_id) {
    const externalId = product.attributes.material.external_id;
    return Array.isArray(externalId) ? externalId[0] : externalId;
  }

  // Extract from current product
  return extractMaterialFromProduct({
    id: product.id,
    title: product.title,
    product_sku: product.product_sku,
    slug: product.slug,
    fullSlug: product.fullSlug,
    status: product.status,
    stockSum: Object.values(product.warehouseStocks).reduce((sum, stock) => sum + (stock || 0), 0),
    attributes: [],
  });
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  });

  // Convert from smallest unit (öre/cents) to main unit
  const mainUnit = price / 100;
  return formatter.format(mainUnit);
}
