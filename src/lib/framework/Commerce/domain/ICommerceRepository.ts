import { type ICommercePrice } from '@/src/lib/framework/Commerce/domain/entities/ICommercePrice';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { type RequestSessionStart, type ShopperSessionResponse } from '@/src/lib/types/session';

export interface ICommerceRepository {
  startSession(sessionStart: RequestSessionStart, isLogout: boolean): Promise<ShopperSessionResponse>;

  /**
   * Retrieves the price information for a given product in a specific market.
   * @param productId - The unique identifier of the product.
   * @param countryCode - The country code for which to retrieve the price.
   * @returns A promise that resolves to an array of ICommercePrice objects.
   */
  getPrice(productId: string, countryCode: string): Promise<ICommercePrice[]>;

  /**
   * Retrieves the stock information for a given product in a specific market.
   * @param productId - The unique identifier of the product.
   * @param countryCode - The country code for which to retrieve the stock information.
   * @returns A promise that resolves to an array of ICommerceStock objects.
   */
  getStock(productId: string, countryCode: string): Promise<ICommerceStock[]>;
  getAvailableStock(productId: string, countryCode: string): Promise<ICommerceStock[]>;
  getStoreGroupId(isLogout?: boolean): Promise<string>;
  getDefaultStoreGroupId(): string;
}
