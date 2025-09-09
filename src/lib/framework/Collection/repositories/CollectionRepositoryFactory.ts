import { type FactoryProvider } from 'tsyringe';
import { Tokens } from '@/src/lib/diTokens';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { AlgoliaCollectionRepository } from '@/src/lib/framework/Collection/repositories/AlgoliaCollectionRepository';
import { FindifyCollectionRepository } from '@/src/lib/framework/Collection/repositories/FindifyCollectionRepository';
import { TypesenseCollectionRepository } from '@/src/lib/framework/Collection/repositories/TypesenseCollectionRepository';
import { SearchEngineEnum } from '@/src/lib/framework/Collection/shared/SearchEngineEnum';

export const collectionRepositoryFactory: FactoryProvider<ICollectionRepository> = {
  useFactory: (dependencyContainer) => {
    const config = dependencyContainer.resolve(Tokens.Configuration);

    switch (config.Search.Engine) {
      case SearchEngineEnum.ALGOLIA:
        return dependencyContainer.resolve(AlgoliaCollectionRepository);

      case SearchEngineEnum.FINDIFY:
        return dependencyContainer.resolve(FindifyCollectionRepository);

      case SearchEngineEnum.TYPESENSE:
        return dependencyContainer.resolve(TypesenseCollectionRepository);

      default:
        throw new Error(`Unknown search engine: ${config.Search.Engine}`);
    }
  },
};
