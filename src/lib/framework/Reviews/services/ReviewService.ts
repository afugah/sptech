import { singleton } from 'tsyringe';
import { di } from '@/src/lib/di';
import { type IReviewRepository } from '@/src/lib/framework/Reviews/domain/IReviewRepository';
import { type IReviewService } from '@/src/lib/framework/Reviews/domain/IReviewService';
import { reviewRepositoryFactory } from '@/src/lib/framework/Reviews/repositories/ReviewRepositoryFactory';

@singleton()
export class ReviewService implements IReviewService {
  private readonly _repository: IReviewRepository;

  constructor() {
    this._repository = reviewRepositoryFactory.useFactory(di);
  }

  public getScore: IReviewRepository['getScore'] = (...args) => {
    return this._repository.getScore(...args);
  };

  public getReviews: IReviewRepository['getReviews'] = (...args) => {
    return this._repository.getReviews(...args);
  };
}
