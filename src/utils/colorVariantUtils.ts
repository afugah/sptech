import { type LocalizedValue, type ProductGroupProduct } from '@/src/types/product';

export interface ColorVariant {
  id: string;
  sku: string;
  title: string;
  imageUrl: string;
  productUrl: string;
  color: string;
  hexColor: string;
}

/**
 * Filters product group products to only return those with valid color information
 * This helps distinguish color variants from material variants
 */
export function getColorVariantsFromGroup(
  productGroupProducts: ProductGroupProduct[],
  locale: keyof LocalizedValue = 'en',
): ColorVariant[] {
  if (!Array.isArray(productGroupProducts)) return [];

  const colorVariants = new Map<string, ColorVariant>();

  productGroupProducts.forEach((product) => {
    // Skip invalid products
    if (!product || (!product.sku && !product.product_sku)) return;

    const sku = product.sku || product.product_sku || '';
    const productUrl = product.productUrl || '';

    // Skip if no URL (can't navigate to variant)
    if (!productUrl) return;

    // Extract color information
    let colorName = product.color || '';
    let hexColor = product.hexColor || '';

    // If we have product attributes, try to extract color from there
    if (!colorName || !hexColor) {
      if (Array.isArray(product.attributes) && product.attributes.length > 0) {
        const colorAttr = product.attributes.find((attr: unknown) => {
          const attrObj = attr as Record<string, unknown>;
          return attrObj.color !== undefined;
        });

        if (colorAttr && typeof colorAttr === 'object' && 'color' in colorAttr) {
          const color = colorAttr.color as Record<string, unknown>;

          // Get color name
          if (color.title && !colorName) {
            const titleObj = color.title as Record<string, string> | string;
            colorName = typeof titleObj === 'object' ? titleObj[locale] || titleObj.en || '' : String(titleObj);
          }

          // Get hex color
          if (color.meta && typeof color.meta === 'object' && 'hexColor' in color.meta && !hexColor) {
            hexColor = String(color.meta.hexColor);
          }
        }
      }
    }

    // Only include products that have color information
    // This helps filter out material-only variants
    if (colorName || hexColor) {
      const title =
        typeof product.title === 'string' ? product.title : (product.title as LocalizedValue)?.[locale] || '';

      // Use hex color as key for uniqueness, fallback to SKU
      const colorKey = hexColor || `color-${sku}`;

      // Add to map if not already present (keeps first occurrence)
      if (!colorVariants.has(colorKey)) {
        colorVariants.set(colorKey, {
          id: product.id?.toString() || '',
          sku: sku,
          title: title,
          imageUrl: product.imageUrl || product.image || '',
          productUrl: productUrl,
          color: colorName,
          hexColor: hexColor,
        });
      }
    }
  });

  // Sort by color name
  return Array.from(colorVariants.values()).sort((a, b) => (a.color || a.title).localeCompare(b.color || b.title));
}

/**
 * Checks if a product group has multiple color variants
 */
export function hasColorVariants(productGroupProducts: ProductGroupProduct[]): boolean {
  const colorVariants = getColorVariantsFromGroup(productGroupProducts);
  return colorVariants.length > 1;
}

/**
 * Gets the current product's color information from the product group
 */
export function getCurrentProductColor(
  currentSku: string,
  productGroupProducts: ProductGroupProduct[],
  locale: keyof LocalizedValue = 'en',
): { colorName: string; hexColor: string } | null {
  const colorVariants = getColorVariantsFromGroup(productGroupProducts, locale);
  const currentVariant = colorVariants.find((variant) => variant.sku === currentSku);

  if (currentVariant) {
    return {
      colorName: currentVariant.color,
      hexColor: currentVariant.hexColor,
    };
  }

  return null;
}
