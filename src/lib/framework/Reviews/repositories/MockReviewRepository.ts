import { singleton } from 'tsyringe';
import { type IReviewRepository } from '@/src/lib/framework/Reviews/domain/IReviewRepository';

@singleton()
export class MockReviewRepository implements IReviewRepository {
  public async getScore() {
    return null;
  }

  public async getReviews() {
    return [];
  }
}
