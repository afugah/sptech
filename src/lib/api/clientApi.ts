/**
 * Client-side API wrapper for making calls to our API endpoints
 * This ensures proper error handling and type safety
 */

import { type StockInfo } from './types';

/**
 * Fetch product stock information
 * @param productId The product ID to check stock for
 * @param countryCode The country code (e.g., 'SE')
 * @returns Promise with stock information
 */
export async function fetchProductStock(productId: string, countryCode: string): Promise<StockInfo[]> {
  // This is a client-side API call that will be protected by our server middleware
  const response = await fetch(`/api/stock/get-product-stock?productId=${productId}&countryCode=${countryCode}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Error fetching client-side stock: ${response.statusText}`);
  }

  return response.json();
}
