import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type ICommercePrice } from '@/src/lib/framework/Commerce/domain/entities/ICommercePrice';
import { type ICommerceStock } from '@/src/lib/framework/Commerce/domain/entities/ICommerceStock';
import { commerceRepositoryFactory } from '@/src/lib/framework/Commerce/repositories/CommerceRepositoryFactory';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type RequestSessionStart, type ShopperSessionResponse } from '@/src/lib/types/session';
import { type ICommerceRepository } from '../domain/ICommerceRepository';

@singleton()
export class CommerceService {
  commerceRepository: ICommerceRepository;

  constructor(@injectLogger('CommerceService') private readonly _logger: LoggerService) {
    this.commerceRepository = commerceRepositoryFactory.useFactory(di);
  }

  public async startSession(sessionStart: RequestSessionStart, isLogout: boolean): Promise<ShopperSessionResponse> {
    return this.commerceRepository.startSession(sessionStart, isLogout).catch((error) => {
      this._logger.error('Error starting session', error);
      throw error;
    });
  }

  public async getPrice(productId: string, countryCode: string): Promise<ICommercePrice[]> {
    return this.commerceRepository.getPrice(productId, countryCode).catch((error) => {
      this._logger.error(`Error fetching price for product "${productId}" for country "${countryCode}"`, error);
      throw error;
    });
  }

  public async getStock(productId: string, countryCode: string): Promise<ICommerceStock[]> {
    return this.commerceRepository.getStock(productId, countryCode).catch((error) => {
      this._logger.error(`Error fetching stock for product "${productId}" for country "${countryCode}"`, error);
      throw error;
    });
  }
  async getAvailableStock(productId: string, countryCode: string): Promise<ICommerceStock[]> {
    return this.commerceRepository.getAvailableStock(productId, countryCode).catch((error) => {
      this._logger.error(`Error fetching stock for product "${productId}" for country "${countryCode}"`, error);
      throw error;
    });
  }
  async getStoreGroupId(isLogout?: boolean): Promise<string> {
    return this.commerceRepository.getStoreGroupId(isLogout).catch((error) => {
      throw error;
    });
  }
  getDefaultStoreGroupId() {
    return this.commerceRepository.getDefaultStoreGroupId();
  }
}
