import { type DependencyContainer } from 'tsyringe';
import { type IStoreRepository } from '../domain/IStoreRepository';
import { StoreRepository } from './StoreRepository';

export const storeRepositoryFactory = {
  useFactory: (_di: DependencyContainer): IStoreRepository => {
    return new StoreRepository();
  },
};
