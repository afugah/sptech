import { type IStore, type IStoreFilters } from './entities/IStore';

export interface IStoreService {
  getStores: (filters?: IStoreFilters) => Promise<{ [country: string]: IStore[] }>;
  getStoresByCountry: (country: string) => Promise<IStore[]>;
  getStoreById: (id: number) => Promise<IStore | null>;
  searchStores: (query: string) => Promise<IStore[]>;
}
