/**
 * Shared API types
 */

/**
 * Stock information interface
 */
export interface StockInfo {
  id: string;
  validateStock: boolean;
  inventories: Array<{ quantity: number }>;
}
