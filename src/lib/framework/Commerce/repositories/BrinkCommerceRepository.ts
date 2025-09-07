import { inject, singleton } from 'tsyringe';
import { auth } from '@/src/lib/auth';
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
  protected readonly apiKey: string = 'BrinkCommerceDefaultApiKey';

  private readonly storeGroupsEnv = process.env.NEXT_PUBLIC_BRINK_STORE_GROUPS || '';
  private readonly storeGroupsInventoryEnv = process.env.NEXT_PUBLIC_BRINK_STORE_GROUP_INVENTORY || '';
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

  public constructor(
    @inject(VoyadoService) private readonly _voyadoService: VoyadoService,
    @injectLogger('BrinkCommerceRepository') private readonly _logger: LoggerService,
  ) {}

  public async getStoreGroupId(isLogout?: boolean): Promise<string> {
    try {
      if (isLogout) return this._defaultStoreGroupId;
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
    const storeGroupId = await this.getStoreGroupId(isLogout);
    const body: IBrink.SessionStartBody = {
      ...sessionStart,
      storeGroupId,
    };

    return this.fetch(`/sessions/start`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getPrice(productId: string, countryCode: string): Promise<ICommercePrice[]> {
    // Use default store group ID to avoid auth() call during SSR
    const storeGroupId = this.getDefaultStoreGroupId();
    return this.fetch<IBrink.PriceResponse>(
      `/prices/product-parents/${productId}/store-groups/${storeGroupId}/markets/${countryCode}`,
      { method: 'GET', next: { revalidate: 60 * 5 } },
    ).then(BrinkCommerceMapper.MapPrice);
  }

  public async getStock(productId: string, countryCode: string): Promise<ICommerceStock[]> {
    const response = await this.fetch<IBrink.StockResponse>(
      `/stocks/product-parents/${productId}/store-groups/${this._defaultStoreGroupId}/markets/${countryCode}`,
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
        'x-api-key': this.apiKey,
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

    return this._voyadoService.getContactByEmail(email).then((contact) => {
      if (contact && contact.attributes) {
        return contact.attributes.bonusBasedLevel || 'member';
      }
      return null;
    });
  }
}
