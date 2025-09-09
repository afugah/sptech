import { type InjectionToken } from 'tsyringe';
import { type IConfiguration } from '@/src/lib/configuration/Configuration';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { type IProductRepository } from '@/src/lib/framework/Product/domain/IProductRepository';

/**
 * See explanation in `di.ts`
 */
export const Tokens = {
  Configuration: 'IConfiguration' as InjectionToken<IConfiguration>,
  LoggerService: 'LoggerService' as InjectionToken<LoggerService>,
  ProductRepository: 'IProductRepository' as InjectionToken<IProductRepository>,
  CollectionRepository: 'ICollectionRepository' as InjectionToken<ICollectionRepository>,
} as const;
