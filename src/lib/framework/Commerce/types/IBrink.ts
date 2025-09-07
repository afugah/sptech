import { type RequestSessionStart } from '@/src/lib/types/session';

export namespace IBrink {
  export interface SessionStartBody extends RequestSessionStart {
    storeGroupId: string;
  }

  /* #region Price */

  export interface PriceResponse {
    productParent: {
      id: string;
      storeGroupId: string;
      countryCode: string;
      currencyCode: string;
      isTaxIncludedInPrice: boolean;
      productVariants: PriceVariant[];
    };
  }

  export interface PriceVariant {
    id: string;
    basePriceAmount: number;
    salePriceAmount: number;
    discountAmount: number;
    taxAmount: number;
    taxPercentage: number;
    taxPercentageDecimals: number;
  }

  /* #endregion */

  /* #region Stock */

  export interface StockResponse {
    productParent: {
      id: string;
      productVariants: StockVariant[];
    };
  }

  export interface StockVariant {
    id: string;
    variantStock: boolean;
    availableQuantity: number;
    isAvailable: boolean;
    reservedQuantity: number;
    stockQuantity: number;
    validateStock: boolean;
    inventories: StocksInventory[];
  }

  export interface StocksInventory {
    id: string;
    availableQuantity: number;
    isAvailable: boolean;
    reserverQuantity: number;
    stockQuantity: number;
  }

  /* #endregion */
}
