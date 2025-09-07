import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type ICollectionRepository } from '@/src/lib/framework/Collection/domain/ICollectionRepository';
import { type ICollectionService } from '@/src/lib/framework/Collection/domain/ICollectionService';
import { collectionRepositoryFactory } from '@/src/lib/framework/Collection/repositories/CollectionRepositoryFactory';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';

@singleton()
export class CollectionService implements ICollectionService {
  private readonly _repository: ICollectionRepository;

  public constructor(@injectLogger('CollectionService') private readonly _logger: LoggerService) {
    this._repository = collectionRepositoryFactory.useFactory(di);
  }

  public getItemsByQuery: ICollectionRepository['getItemsByQuery'] = (
    ...args: Parameters<ICollectionRepository['getItemsByQuery']>
  ) =>
    this._repository.getItemsByQuery(...args).catch((err) => {
      this._logger.error('Error fetching items', err);
      throw err;
    });

  public getFacetsBySlugOrQuery: ICollectionRepository['getFacetsBySlugOrQuery'] = (...args) =>
    this._repository.getFacetsBySlugOrQuery(...args).catch((err) => {
      this._logger.error('Error fetching facets', err);
      throw err;
    });

  public getSearchAutocomplete: ICollectionRepository['getSearchAutocomplete'] = (...args) =>
    this._repository.getSearchAutocomplete(...args).catch((err) => {
      this._logger.error('Error fetching search autocomplete', err);
      throw err;
    });

  public getItemsBySlug: ICollectionRepository['getItemsBySlug'] = (...args) =>
    this._repository.getItemsBySlug(...args).catch((err) => {
      this._logger.error('Error fetching items by slug', err);
      throw err;
    });

  public getItems: ICollectionRepository['getItems'] = (...args) =>
    this._repository.getItems(...args).catch((err) => {
      this._logger.error('Error fetching items', err);
      throw err;
    });

  public getRecommendedItems: ICollectionRepository['getRecommendedItems'] = (...args) =>
    this._repository.getRecommendedItems(...args).catch((err) => {
      this._logger.error('Error fetching recommended items', err);
      throw err;
    });

  public postFeedback: ICollectionRepository['postFeedback'] = (...args) =>
    this._repository.postFeedback(...args).catch((err) => {
      this._logger.error('Error posting feedbaaack', err.message);
      throw err;
    });
}
