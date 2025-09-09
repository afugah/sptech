import { type FactoryProvider } from 'tsyringe';
import { Tokens } from '@/src/lib/diTokens';
import { SearchEngineEnum } from '@/src/lib/framework/Collection/shared/SearchEngineEnum';
import { type IProductRepository } from '@/src/lib/framework/Product/domain/IProductRepository';
import { ElasticSearchRepository } from '@/src/lib/framework/Product/repositories/ElasticSearchRepository';
import { TypesenseRepository } from '@/src/lib/framework/Product/repositories/TypesenseRepository';

export const productRepositoryFactory: FactoryProvider<IProductRepository> = {
  useFactory: (dependencyContainer) => {
    const config = dependencyContainer.resolve(Tokens.Configuration);

    switch (config.Search.Engine) {
      case SearchEngineEnum.TYPESENSE:
        return dependencyContainer.resolve(TypesenseRepository);

      case SearchEngineEnum.ALGOLIA:
      case SearchEngineEnum.FINDIFY:
      default:
        // Default to ElasticSearchRepository for existing engines
        return dependencyContainer.resolve(ElasticSearchRepository);
    }
  },
};
