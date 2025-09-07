import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IProductVariant } from '@/src/lib/framework/Product/domain/entities/IProductVariant';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
// Debug logging removed - keeping calls for future debugging but silenced
const stockDebug = { log: (..._args: unknown[]) => {} };

/**
 * Stock Type Rules (from ElasticSearch variant.stockTypeVariant field):
 *
 * MTO (Made to Order):
 *   - With stock > 0: Green dot, "In stock – Ships within 3 business days", purchasable
 *   - With stock ≤ 0: Yellow dot, "Made to order – Manufacturing ready" + leadTime date, purchasable
 *
 * NOOS (Never Out Of Stock) / LAGERVARA:
 *   - With stock > 0: Green dot, "In stock – Ships within 3 business days", purchasable
 *   - With stock ≤ 0: No dot, "Temporarily out of stock online" + availabilityDate, purchasable
 *
 * SLEEPING BEAUTY / Seasonal (Limited Edition):
 *   - With stock > 0: Green dot, "In stock – Ships within 3 business days", purchasable
 *   - With stock ≤ 0: No dot, no status message, NOT purchasable, reduced opacity
 *
 * Standard variants (no specific stockTypeVariant):
 *   - With stock > 0: Green dot, "In stock", purchasable
 *   - With stock ≤ 0: No dot, "Out of stock", NOT purchasable, reduced opacity
 */

// Helper function to get stock type from variant only (no fallback to product)
function getStockType(elasticVariant?: IElasticSearch.ProductVariant): string | undefined {
  // Debug: Log the raw elastic variant structure
  if (elasticVariant) {
    stockDebug.log('getStockTypeDebug', {
      sku: elasticVariant.sku,
      hasAttributes: !!elasticVariant.attributes,
      hasStockTypeVariant: !!elasticVariant.attributes?.stockTypeVariant,
      stockTypeVariantType: typeof elasticVariant.attributes?.stockTypeVariant,
      stockTypeVariantKeys: elasticVariant.attributes?.stockTypeVariant
        ? Object.keys(elasticVariant.attributes.stockTypeVariant)
        : [],
      stockTypeVariantValue: elasticVariant.attributes?.stockTypeVariant?.value,
      stockTypeVariantValueType: typeof elasticVariant.attributes?.stockTypeVariant?.value,
      stockTypeVariantValueKeys:
        elasticVariant.attributes?.stockTypeVariant?.value &&
        typeof elasticVariant.attributes?.stockTypeVariant?.value === 'object'
          ? Object.keys(elasticVariant.attributes.stockTypeVariant.value)
          : [],
      stockTypeVariantValueEn: elasticVariant.attributes?.stockTypeVariant?.value?.['en'],
      rawStockTypeVariant: JSON.stringify(elasticVariant.attributes?.stockTypeVariant),
    });
  } else {
    stockDebug.log('getStockTypeNoVariant', { elasticVariant });
  }

  // Try multiple paths to get stockTypeVariant
  // Path 1: attributes.stockTypeVariant.value.en
  const variantStockType = elasticVariant?.attributes?.stockTypeVariant?.value?.['en'];
  if (variantStockType) {
    stockDebug.log('stockTypeFound', {
      path: 'value.en',
      value: variantStockType,
      originalValue: variantStockType,
      lowercaseValue: variantStockType.toLowerCase(),
    });
    return variantStockType.toLowerCase();
  }

  // Path 2: attributes.stockTypeVariant.value as string directly
  const directValue = elasticVariant?.attributes?.stockTypeVariant?.value;
  if (typeof directValue === 'string') {
    stockDebug.log('stockTypeFound', {
      path: 'value-direct',
      value: directValue,
      originalValue: directValue,
      lowercaseValue: (directValue as string).toLowerCase(),
    });
    return (directValue as string).toLowerCase();
  }

  // Path 3: Check all language keys in value object
  if (directValue && typeof directValue === 'object') {
    const firstValue = Object.values(directValue)[0];
    if (typeof firstValue === 'string') {
      stockDebug.log('stockTypeFound', {
        path: 'value-first-lang',
        value: firstValue,
        originalValue: firstValue,
        lowercaseValue: firstValue.toLowerCase(),
        allValues: Object.values(directValue),
      });
      return firstValue.toLowerCase();
    }
  }

  stockDebug.log('stockTypeNotFound', {
    sku: elasticVariant?.sku,
    attributes: !!elasticVariant?.attributes,
    stockTypeVariant: elasticVariant?.attributes?.stockTypeVariant,
  });
  return undefined;
}

// Helper function to calculate date from lead time days
function calculateDateFromLeadTime(days: string | undefined): string {
  if (!days) return '';
  const daysNum = parseInt(days, 10);
  if (isNaN(daysNum)) return '';

  const date = new Date();
  date.setDate(date.getDate() + daysNum);
  return date.toISOString().split('T')[0];
}

// Helper function to extract attribute value from Elastic structure
function getElasticAttributeValue(
  elasticVariant: IElasticSearch.ProductVariant | undefined,
  elasticProduct: IElasticSearch.Item | undefined,
  attributePath: string,
): string | undefined {
  // Try variant first, then fall back to product level
  const sources = [elasticVariant, elasticProduct].filter(Boolean);

  for (const source of sources) {
    if (!source) continue;

    // Try multiple possible paths for leadTime
    const pathsToTry = [
      attributePath, // Original path: attributes.leadTime.value
      attributePath.replace('attributes.', ''), // Without attributes prefix: leadTime.value
    ];

    for (const fullPath of pathsToTry) {
      const paths = fullPath.split('.');
      let current: unknown = source;

      for (const path of paths) {
        if (current && typeof current === 'object' && path in current) {
          current = (current as Record<string, unknown>)[path];
        } else {
          current = undefined;
          break;
        }
      }

      if (current === undefined) continue;

      // Handle different value structures
      if (typeof current === 'string') {
        return current;
      }

      if (current && typeof current === 'object') {
        const currentObj = current as Record<string, unknown>;
        if ('value' in currentObj && typeof currentObj.value === 'string') {
          return currentObj.value;
        }
      }
    }
  }

  return undefined;
}

export interface StockRule {
  condition: (
    variant: IProductVariant,
    product?: IProduct,
    elasticVariant?: IElasticSearch.ProductVariant,
    elasticProduct?: IElasticSearch.Item,
  ) => boolean;
  status: (
    variant: IProductVariant,
    product?: IProduct,
    t?: (key: string) => string,
    elasticVariant?: IElasticSearch.ProductVariant,
    elasticProduct?: IElasticSearch.Item,
  ) => string;
  dotColor?: 'green' | 'yellow' | 'red' | null;
  allowPurchase: boolean;
  selectable: boolean;
  opacity?: number;
}

export interface StockRuleResult {
  status: string;
  dotColor?: 'green' | 'yellow' | 'red' | null;
  allowPurchase: boolean;
  selectable: boolean;
  opacity?: number;
  ruleIndex?: number;
  ruleName?: string;
}

// Stock rules definition using variant's stockTypeVariant field from elastic data (no product fallback)
export const stockRules: StockRule[] = [
  // Rule 1: stockType=MTO and stock>0 (MTO variant in stock)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return stockType === 'mto' && stock > 0;
    },
    status: (_variant, _product, t) =>
      t?.('stock-status.in-stock-ships-3-days') ?? 'In stock, ships within 3 business days',
    dotColor: 'green',
    allowPurchase: true,
    selectable: true,
  },

  // Rule 2: stockType=MTO and stock<=0 (MTO variant out of stock)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return stockType === 'mto' && stock <= 0;
    },
    status: (_variant, _product, t, elasticVariant, elasticProduct) => {
      // Try to get leadTime from variant's attributes first, then fall back to getElasticAttributeValue
      let leadTime: string | undefined;

      // Check if leadTime exists directly on elasticVariant.attributes
      if (elasticVariant?.attributes?.leadTime?.value) {
        leadTime = elasticVariant.attributes.leadTime.value;
      } else {
        // Fall back to the helper function for other possible locations
        leadTime = getElasticAttributeValue(elasticVariant, elasticProduct, 'attributes.leadTime.value');
      }

      const readyDate = calculateDateFromLeadTime(leadTime);

      // Debug logging
      stockDebug.log('mtoStatus', {
        leadTime,
        readyDate,
        elasticVariantSku: elasticVariant?.sku,
        hasElasticProduct: !!elasticProduct,
        hasElasticVariant: !!elasticVariant,
        variantAttributes: elasticVariant?.attributes,
      });

      const orderItemReady = t?.('stock-status.order-item-ready') ?? 'Made to order – Manufacturing ready';
      return readyDate ? `${orderItemReady} ${readyDate}` : orderItemReady;
    },
    dotColor: 'yellow',
    allowPurchase: true,
    selectable: true,
  },

  // Rule 3: stockType=NOOS or LAGERVARA and stock>0 (Never Out Of Stock / Stock Item in stock)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return (stockType === 'noos' || stockType === 'lagervara') && stock > 0;
    },
    status: (_variant, _product, t, _elasticVariant, _elasticProduct) =>
      t?.('stock-status.in-stock-ships-3-days') ?? 'In stock – Ships within 3 business days',
    dotColor: 'green',
    allowPurchase: true,
    selectable: true,
  },

  // Rule 4: stockType=NOOS or LAGERVARA and stock<=0 (Temporarily out of stock but can be ordered)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return (stockType === 'noos' || stockType === 'lagervara') && stock <= 0;
    },
    status: (_variant, _product, t, elasticVariant, elasticProduct) => {
      const availabilityDate = getElasticAttributeValue(
        elasticVariant,
        elasticProduct,
        'attributes.availability_date_cl.value',
      );
      const temporarilyOut =
        t?.('stock-status.temporarily-out-ships') ?? 'Temporarily out of stock online – Ships earliest';
      return availabilityDate ? `${temporarilyOut} ${availabilityDate}` : temporarilyOut;
    },
    dotColor: 'yellow',
    allowPurchase: true, // Can still purchase unlike regular out of stock
    selectable: true,
  },

  // Rule 5: stockType=SLEEPING BEAUTY or Seasonal and stock>0 (Limited edition in stock)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return (stockType === 'sleeping beauty' || stockType === 'seasonal') && stock > 0;
    },
    status: (_variant, _product, t) =>
      t?.('stock-status.in-stock-ships-3-days') ?? 'In stock – Ships within 3 business days',
    dotColor: 'green',
    allowPurchase: true,
    selectable: true,
  },

  // Rule 6: stockType=SLEEPING BEAUTY or Seasonal and stock<=0 (Limited edition out of stock - not orderable)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      return (stockType === 'sleeping beauty' || stockType === 'seasonal') && stock <= 0;
    },
    status: (_variant, _product, _t, _elasticVariant, _elasticProduct) => '', // No status message shown
    dotColor: null,
    allowPurchase: false,
    selectable: false,
    opacity: 0.7,
  },

  // Rule 7: Standard stock item with stock>0 (no specific stockType)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      // Only apply this rule if stockType is undefined (not MTO, NOOS, LAGERVARA, or SLEEPING BEAUTY/Seasonal)
      return !stockType && stock > 0;
    },
    status: (_variant, _product, t) => t?.('stock-status.in-stock') ?? 'In stock',
    dotColor: 'green',
    allowPurchase: true,
    selectable: true,
  },

  // Rule 8: Standard stock item out of stock (no specific stockType)
  {
    condition: (variant, _product, elasticVariant, _elasticProduct) => {
      const stockType = getStockType(elasticVariant);
      const stock = variant.stock?.quantity ?? 0;
      // Only apply this rule if stockType is undefined (not MTO, NOOS, LAGERVARA, or SLEEPING BEAUTY/Seasonal)
      return !stockType && stock <= 0;
    },
    status: (_variant, _product, t) => t?.('stock-status.out-of-stock') ?? 'Out of stock',
    dotColor: null,
    allowPurchase: false,
    selectable: false,
    opacity: 0.7,
  },
];

// Main function to evaluate stock rules
export function evaluateStockRules(
  variant: IProductVariant,
  product?: IProduct,
  t?: (key: string) => string,
  elasticVariant?: IElasticSearch.ProductVariant,
  elasticProduct?: IElasticSearch.Item,
): StockRuleResult {
  // Get stock type once for all rules
  const stockType = getStockType(elasticVariant);
  const stock = variant.stock?.quantity ?? 0;

  // Log once per variant with all relevant info
  stockDebug.log(`variantEvaluation_${variant.sku}`, {
    sku: variant.sku,
    stockQuantity: stock,
    stockType,
    stockTypeVariant: elasticVariant?.attributes?.stockTypeVariant?.value?.['en'],
    hasProductData: !!product,
    hasElasticData: !!elasticProduct,
    hasElasticVariant: !!elasticVariant,
  });

  // Evaluate each rule in priority order
  for (const rule of stockRules) {
    const ruleIndex = stockRules.indexOf(rule) + 1;
    const conditionMet = rule.condition(variant, product, elasticVariant, elasticProduct);

    if (conditionMet) {
      // Only log the matching rule
      stockDebug.log(`ruleMatched_${variant.sku}`, {
        sku: variant.sku,
        ruleIndex,
        stockType,
        stock,
        hasElasticVariant: !!elasticVariant,
      });
      // Generate rule name based on the rule conditions
      let ruleName = `Rule ${ruleIndex}: `;
      if (ruleIndex === 1) ruleName += 'MTO with stock > 0';
      else if (ruleIndex === 2) ruleName += 'MTO with stock ≤ 0';
      else if (ruleIndex === 3) ruleName += 'NOOS/LAGERVARA with stock > 0';
      else if (ruleIndex === 4) ruleName += 'NOOS/LAGERVARA with stock ≤ 0';
      else if (ruleIndex === 5) ruleName += 'SLEEPING BEAUTY/Seasonal with stock > 0';
      else if (ruleIndex === 6) ruleName += 'SLEEPING BEAUTY/Seasonal with stock ≤ 0';
      else if (ruleIndex === 7) ruleName += 'Standard variant with stock > 0';
      else if (ruleIndex === 8) ruleName += 'Standard variant with stock ≤ 0';
      const result = {
        status: rule.status(variant, product, t, elasticVariant, elasticProduct),
        dotColor: rule.dotColor,
        allowPurchase: rule.allowPurchase,
        selectable: rule.selectable,
        opacity: rule.opacity,
        ruleIndex,
        ruleName,
      };

      return result;
    }
  }

  // Default rule if none match
  return {
    status: '',
    dotColor: null,
    allowPurchase: true,
    selectable: true,
  };
}

/**
 * Simplified stock evaluation for Brink data (used in cart/checkout)
 * This function evaluates stock status based on Brink data structure
 * without ElasticSearch dependency
 *
 * @param stockQuantity - Current stock quantity from Brink
 * @param validateStock - Whether stock validation is required (from Brink)
 * @param stockType - Stock type (MTO, NOOS, etc.) - may come from customAttributes
 * @param t - Translation function
 * @returns StockRuleResult with status and visual indicators
 */
export function evaluateStockRulesForBrink(
  stockQuantity: number,
  validateStock: boolean,
  stockType?: string,
  t?: (key: string) => string,
): StockRuleResult {
  const stock = stockQuantity ?? 0;
  const normalizedStockType = stockType?.toLowerCase();

  // Debug logging
  stockDebug.log('brinkStockEvaluation', {
    stockQuantity: stock,
    validateStock,
    stockType: normalizedStockType,
  });

  // MTO (Made to Order) products
  if (normalizedStockType === 'mto') {
    if (stock > 0) {
      return {
        status:
          t?.('product-page.stock-status.mto-in-stock') ?? 'Made to order – In stock, ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: MTO with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.order-item-ready') ?? 'Made to order – Manufacturing ready',
        dotColor: 'yellow',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: MTO with stock ≤ 0',
      };
    }
  }

  // NOOS (Never Out Of Stock) / LAGERVARA products
  if (normalizedStockType === 'noos' || normalizedStockType === 'lagervara') {
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock-ships-3-days') ?? 'In stock – Ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: NOOS/LAGERVARA with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.temporarily-out-ships') ?? 'Temporarily out of stock online',
        dotColor: null,
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: NOOS/LAGERVARA with stock ≤ 0',
      };
    }
  }

  // SLEEPING BEAUTY / Seasonal (Limited Edition) products
  if (
    normalizedStockType === 'sleeping beauty' ||
    normalizedStockType === 'seasonal' ||
    normalizedStockType === 'limited edition'
  ) {
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock-ships-3-days') ?? 'In stock – Ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: Seasonal with stock > 0',
      };
    } else {
      // Out of stock seasonal items are not purchasable
      return {
        status: '',
        dotColor: null,
        allowPurchase: false,
        selectable: false,
        opacity: 0.4,
        ruleName: 'Brink: Seasonal with stock ≤ 0',
      };
    }
  }

  // Standard products or when stockType is unknown
  // Use validateStock flag to determine behavior
  if (!validateStock) {
    // Products with validateStock=false can be purchased even when out of stock (MTO-like behavior)
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock') ?? 'In stock',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: No validation required, stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.order-item-ready') ?? 'Made to order – Manufacturing ready',
        dotColor: 'yellow',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: No validation required, stock ≤ 0',
      };
    }
  } else {
    // Standard products with stock validation
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock') ?? 'In stock',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink: Standard with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.out-of-stock') ?? 'Out of stock',
        dotColor: null,
        allowPurchase: false,
        selectable: false,
        opacity: 0.4,
        ruleName: 'Brink: Standard with stock ≤ 0',
      };
    }
  }
}

/**
 * Simplified stock evaluation for Brink data with SHORT messages (used in cart/checkout)
 * Returns only the second part of the stock status messages
 * e.g., "In stock – Ships within 3 business days" becomes "Ships within 3 business days"
 *
 * @param stockQuantity - Current stock quantity from Brink
 * @param validateStock - Whether stock validation is required (from Brink)
 * @param stockType - Stock type (MTO, NOOS, etc.) - may come from customAttributes
 * @param t - Translation function
 * @returns StockRuleResult with short status messages and visual indicators
 */
export function evaluateStockRulesForBrinkShort(
  stockQuantity: number,
  validateStock: boolean,
  stockType?: string,
  t?: (key: string) => string,
): StockRuleResult {
  const stock = stockQuantity ?? 0;
  const normalizedStockType = stockType?.toLowerCase();

  // Debug logging
  stockDebug.log('brinkStockEvaluationShort', {
    stockQuantity: stock,
    validateStock,
    stockType: normalizedStockType,
  });

  // MTO (Made to Order) products
  if (normalizedStockType === 'mto') {
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.mto-ships-3-days-short') ?? 'In stock, ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: MTO with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.mto-manufacturing-ready-short') ?? 'Manufacturing ready',
        dotColor: 'yellow',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: MTO with stock ≤ 0',
      };
    }
  }

  // NOOS (Never Out Of Stock) / LAGERVARA products
  if (normalizedStockType === 'noos' || normalizedStockType === 'lagervara') {
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.ships-3-days-short') ?? 'Ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: NOOS/LAGERVARA with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.temporarily-out-short') ?? 'Ships earliest',
        dotColor: null,
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: NOOS/LAGERVARA with stock ≤ 0',
      };
    }
  }

  // SLEEPING BEAUTY / Seasonal (Limited Edition) products
  if (
    normalizedStockType === 'sleeping beauty' ||
    normalizedStockType === 'seasonal' ||
    normalizedStockType === 'limited edition'
  ) {
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.ships-3-days-short') ?? 'Ships within 3 business days',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: Seasonal with stock > 0',
      };
    } else {
      // Out of stock seasonal items are not purchasable
      return {
        status: '',
        dotColor: null,
        allowPurchase: false,
        selectable: false,
        opacity: 0.4,
        ruleName: 'Brink Short: Seasonal with stock ≤ 0',
      };
    }
  }

  // Standard products or when stockType is unknown
  // Use validateStock flag to determine behavior
  if (!validateStock) {
    // Products with validateStock=false can be purchased even when out of stock (MTO-like behavior)
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock') ?? 'In stock',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: No validation required, stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.available-to-order-short') ?? 'Available to order',
        dotColor: 'yellow',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: No validation required, stock ≤ 0',
      };
    }
  } else {
    // Standard products with stock validation
    if (stock > 0) {
      return {
        status: t?.('product-page.stock-status.in-stock') ?? 'In stock',
        dotColor: 'green',
        allowPurchase: true,
        selectable: true,
        ruleName: 'Brink Short: Standard with stock > 0',
      };
    } else {
      return {
        status: t?.('product-page.stock-status.out-of-stock') ?? 'Out of stock',
        dotColor: null,
        allowPurchase: false,
        selectable: false,
        opacity: 0.4,
        ruleName: 'Brink Short: Standard with stock ≤ 0',
      };
    }
  }
}
