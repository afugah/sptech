/**
 * Internal API wrapper for making authenticated calls to internal APIs
 * This ensures the internal API secret is only used server-side
 */

import { type StockInfo } from './types';

/**
 * Fetch product stock information from server-side
 * @param productId The product ID to check stock for
 * @param countryCode The country code (e.g., 'SE')
 * @returns Promise with stock information
 */
export async function fetchProductStock(productId: string, countryCode: string): Promise<StockInfo[]> {
  // This should only be called from a server component or API route
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/stock/get-product-stock?productId=${productId}&countryCode=${countryCode}`,
    {
      method: 'GET',
      headers: {
        'x-internal-api': process.env.INTERNAL_API_SECRET || '',
      },
      // Ensure this is a server-side request
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(`Error fetching internal stock: ${response.statusText}`);
  }

  return response.json();
}
