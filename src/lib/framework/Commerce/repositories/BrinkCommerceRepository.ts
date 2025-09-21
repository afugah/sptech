import { inject, singleton } from 'tsyringe';
import { auth } from '@/src/lib/auth';
import { isVoyadoEnabled } from '@/src/lib/features';
import { BrinkCommerceMapper } from '@/src/lib/framework/Commerce/repositories/mappers/BrinkCommerceMapper';
import { type IBrink } from '@/src/lib/framework/Commerce/types/IBrink';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import { type RequestSessionStart, type ShopperSessionResponse } from '@/src/lib/types/session';
import { type ICommercePrice } from '../domain/entities/ICommercePrice';
import { type ICommerceStock } from '../domain/entities/ICommerceStock';
import { type ICommerceRepository } from '../domain/ICommerceRepository';

@singleton()
export class BrinkCommerceRepository implements ICommerceRepository {
  private readonly _defaultStoreGroupId: string = process.env.NEXT_PUBLIC_BRINK_STORE_GROUP_ID || '';

  protected readonly baseUrl: string = process.env.NEXT_PUBLIC_BRINK_API_URL || '';
  protected readonly apiKey: string = process.env.BRINK_SHOPPER_X_API_KEY || 'BrinkCommerceDefaultApiKey';

  private readonly storeGroupsEnv = process.env.NEXT_PUBLIC_BRINK_STORE_GROUPS || '';
  private readonly storeGroupsInventoryEnv = process.env.NEXT_PUBLIC_BRINK_STORE_GROUP_INVENTORY || '';

  // Store group mapping - currently only Sweden is supported in staging
  private get countryStoreGroupMap(): Record<string, string> {
    return {
      SE: this._defaultStoreGroupId, // Sweden uses the configured store group
      // Other countries fall back to default store group
      // NO: this._defaultStoreGroupId, // Norway - not currently supported in staging
      // DK: this._defaultStoreGroupId, // Denmark - not currently supported in staging
      // FI: this._defaultStoreGroupId, // Finland - not currently supported in staging
    };
  }

  protected get storeGroups(): Record<string, string> {
    const env = this.storeGroupsEnv;
    if (!env?.length) return {};

    const groups = env ? env.split(';') : [];

    return groups.reduce<Record<string, string>>((acc, group) => {
      const [key, value] = group
        .trim()
        .split(':')
        .map((s) => s.trim());
      return { ...acc, [key.toLowerCase()]: value };
    }, {});
  }

  public getStoreGroupForCountry(countryCode: string): string {
    // First try country-specific mapping
    const countrySpecificStoreGroup = this.countryStoreGroupMap[countryCode.toUpperCase()];
    if (countrySpecificStoreGroup) {
      return countrySpecificStoreGroup;
    }

    // Fallback to default store group
    return this._defaultStoreGroupId;
  }

  public constructor(
    @inject(VoyadoService) private readonly _voyadoService: VoyadoService,
    @injectLogger('BrinkCommerceRepository') private readonly _logger: LoggerService,
  ) {}

  public async getStoreGroupId(isLogout?: boolean): Promise<string> {
    try {
      if (isLogout) return this._defaultStoreGroupId;

      // Skip Voyado member level checking if Voyado is disabled
      if (!isVoyadoEnabled()) {
        return this._defaultStoreGroupId;
      }

      let session = null;
      try {
        session = await auth();
      } catch (error) {
        this._logger.error('Error retrieving session:', error);
        return this._defaultStoreGroupId;
      }
      const sessionEmail = session?.user?.email;

      if (!sessionEmail) return this._defaultStoreGroupId;

      const memberLevel = await this.fetchMemberLevel(sessionEmail);

      if (!memberLevel) return this._defaultStoreGroupId;

      const normalizedMemberLevel = memberLevel.toLowerCase();

      const storeGroupId = this.storeGroups[normalizedMemberLevel];

      if (storeGroupId) return storeGroupId;

      return this._defaultStoreGroupId;
    } catch (error) {
      this._logger.error('Error fetching store group ID:', error);
      return this._defaultStoreGroupId;
    }
  }
  public getDefaultStoreGroupId() {
    return this._defaultStoreGroupId;
  }
  public async startSession(sessionStart: RequestSessionStart, isLogout?: boolean): Promise<ShopperSessionResponse> {
    // Use country-specific store group mapping for the request country
    const countrySpecificStoreGroup = this.getStoreGroupForCountry(sessionStart.countryCode);
    const memberStoreGroupId = await this.getStoreGroupId(isLogout);

    // Use country-specific store group if available, otherwise use member-based store group
    const storeGroupId =
      countrySpecificStoreGroup !== this._defaultStoreGroupId ? countrySpecificStoreGroup : memberStoreGroupId;

    const body: IBrink.SessionStartBody = {
      ...sessionStart,
      storeGroupId,
    };

    this._logger.info(`Starting session with store group: ${storeGroupId}, country: ${sessionStart.countryCode}`);

    try {
      return await this.fetch(`/sessions/start`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      // If the error is about store group configuration, log it and provide helpful information
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('store group id') && errorMessage.includes('not found')) {
        this._logger.error(
          `Store group configuration error: [store group id ${storeGroupId}, countryCode ${sessionStart.countryCode} not found]:. Attempting with default store group.`,
        );
        this._logger.error(`Current configuration: NEXT_PUBLIC_BRINK_STORE_GROUP_ID=${this._defaultStoreGroupId}`);
        this._logger.error(`Available store groups from env: ${JSON.stringify(this.storeGroups)}`);
        this._logger.error(
          `Please verify the store group configuration in BrinkCommerce admin for country ${sessionStart.countryCode}`,
        );

        // Try with a fallback store group ID
        const fallbackBody: IBrink.SessionStartBody = {
          ...sessionStart,
          storeGroupId: 'default', // Use 'default' as fallback
        };

        try {
          return await this.fetch(`/sessions/start`, {
            method: 'POST',
            body: JSON.stringify(fallbackBody),
          });
        } catch (fallbackError) {
          const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          this._logger.error(`Fallback with 'default' store group also failed: ${fallbackErrorMessage}`);

          // Try one more fallback with a working store group but different country
          // This allows the session to start even if the specific country isn't supported
          const compatibleCountryFallback: IBrink.SessionStartBody = {
            ...sessionStart,
            countryCode: 'NO', // Use Norway as fallback (known to work with Europe store group)
            storeGroupId: 'Europe',
          };

          try {
            this._logger.warn(
              `Attempting emergency fallback: Using NO country with Europe store group for ${sessionStart.countryCode} request`,
            );
            return await this.fetch(`/sessions/start`, {
              method: 'POST',
              body: JSON.stringify(compatibleCountryFallback),
            });
          } catch (emergencyError) {
            const emergencyErrorMessage =
              emergencyError instanceof Error ? emergencyError.message : String(emergencyError);
            this._logger.error(`Emergency fallback also failed: ${emergencyErrorMessage}`);
            this._logger.error(
              `All fallback attempts failed for country ${sessionStart.countryCode}. This country may not be supported in the current environment (${process.env.NEXT_PUBLIC_BRINK_ENV}).`,
            );
            throw new Error(
              `Store group configuration error: Country ${sessionStart.countryCode} is not supported in the current environment. Please use a supported country or contact support to add ${sessionStart.countryCode} to the store group configuration.`,
            );
          }
        }
      }

      // Re-throw if it's a different error
      throw error;
    }
  }

  public async getPrice(productId: string, countryCode: string): Promise<ICommercePrice[]> {
    // Use country-specific store group for the request country
    const storeGroupId = this.getStoreGroupForCountry(countryCode);
    return this.fetch<IBrink.PriceResponse>(
      `/prices/product-parents/${productId}/store-groups/${storeGroupId}/markets/${countryCode}`,
      { method: 'GET', next: { revalidate: 60 * 5 } },
    ).then(BrinkCommerceMapper.MapPrice);
  }

  public async getStock(productId: string, countryCode: string): Promise<ICommerceStock[]> {
    // Use country-specific store group for the request country
    const storeGroupId = this.getStoreGroupForCountry(countryCode);
    const response = await this.fetch<IBrink.StockResponse>(
      `/stocks/product-parents/${productId}/store-groups/${storeGroupId}/markets/${countryCode}`,
      {
        method: 'GET',
        next: {
          revalidate: 10, // Reduced from 60 to 10 seconds for near real-time stock
          tags: [`stock-${productId}-${countryCode}`, 'inventory'], // Added cache tags for granular invalidation
        },
      },
    );

    return BrinkCommerceMapper.MapStock(response);
  }
  public async getAvailableStock(productId: string, countryCode: string): Promise<ICommerceStock[]> {
    return this.fetch<IBrink.StockResponse>(
      `/stocks/product-parents/${productId}/store-groups/${this.storeGroupsInventoryEnv}/markets/${countryCode}`,
      {
        method: 'GET',
        next: {
          revalidate: 10, // Reduced from 60 to 10 seconds for near real-time stock
          tags: [`stock-${productId}-${countryCode}`, 'inventory'], // Added cache tags for granular invalidation
        },
      },
    ).then(BrinkCommerceMapper.MapStock);
  }

  protected async fetch<T>(
    endpoint: string,
    options: RequestInit & Required<Pick<RequestInit, 'method'>>,
    authorization?: string,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-shopper-api-key': this.apiKey,
        Authorization: authorization ?? '',
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json();
  }

  protected async handleError(response: Response): Promise<void> {
    const error = await response.json().catch(() => {
      throw new Error(response.statusText);
    });

    let message = '';

    if ('error' in error) {
      message += `[${error.error}]:`;
    }

    if ('message' in error) {
      message += error.message;
    }

    throw new Error(message);
  }

  private async fetchMemberLevel(email: string | null | undefined): Promise<string | null> {
    if (!email) return null;

    // Only fetch member level if Voyado is enabled
    if (!isVoyadoEnabled()) {
      return null;
    }

    return this._voyadoService.getContactByEmail(email).then((contact) => {
      if (contact && contact.attributes) {
        return contact.attributes.bonusBasedLevel || 'member';
      }
      return null;
    });
  }
}
