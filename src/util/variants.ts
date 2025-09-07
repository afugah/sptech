import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';

const sizeOrder: string[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'];

/**
 * Sorts product variants by size.
 *
 * @param variants - The product variants to sort.
 * @returns The sorted product variants.
 */
export const sortVariantsBySize = (variants: IProductVariant[]): IProductVariant[] => {
  if (!variants?.length) return [];

  const variantsWithIndex = variants.map((variant, index) => ({ variant, index }));

  return variantsWithIndex
    .sort((a, b) => {
      const aVariant = a.variant.size;
      const bVariant = b.variant.size;

      if (!aVariant || !bVariant) return 0;

      const aNumeric = parseFloat(aVariant.replace(/[^\d.]/g, ''));
      const bNumeric = parseFloat(bVariant.replace(/[^\d.]/g, ''));

      if (!isNaN(aNumeric) && !isNaN(bNumeric)) {
        const numComparison = aNumeric - bNumeric;
        return numComparison !== 0 ? numComparison : a.index - b.index;
      }

      const aIndex = sizeOrder.indexOf(aVariant.toUpperCase());
      const bIndex = sizeOrder.indexOf(bVariant.toUpperCase());

      if (aIndex !== -1 && bIndex !== -1) {
        const sizeComparison = aIndex - bIndex;
        return sizeComparison !== 0 ? sizeComparison : a.index - b.index;
      }

      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      const orderComparison = a.variant.order - b.variant.order;
      return orderComparison !== 0 ? orderComparison : a.index - b.index;
    })
    .map((item) => item.variant);
};
