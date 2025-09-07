import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { type IStoreRepository } from '@/src/lib/framework/Store/domain/IStoreRepository';
import { type IStoreService } from '@/src/lib/framework/Store/domain/IStoreService';
import { storeRepositoryFactory } from '@/src/lib/framework/Store/repositories/StoreRepositoryFactory';

@singleton()
export class StoreService implements IStoreService {
  private readonly _repository: IStoreRepository;

  public constructor(@injectLogger('StoreService') private readonly _logger: LoggerService) {
    this._repository = storeRepositoryFactory.useFactory(di);
  }

  public getStores: IStoreRepository['getStores'] = (...args) =>
    this._repository.getStores(...args).catch((err) => {
      this._logger.error('Error fetching stores', err);
      throw err;
    });

  public getStoresByCountry: IStoreRepository['getStoresByCountry'] = (...args) =>
    this._repository.getStoresByCountry(...args).catch((err) => {
      this._logger.error('Error fetching stores by country', err);
      throw err;
    });

  public getStoreById: IStoreRepository['getStoreById'] = (...args) =>
    this._repository.getStoreById(...args).catch((err) => {
      this._logger.error('Error fetching store by id', err);
      throw err;
    });

  public searchStores: IStoreRepository['searchStores'] = (...args) =>
    this._repository.searchStores(...args).catch((err) => {
      this._logger.error('Error searching stores', err);
      throw err;
    });
}
