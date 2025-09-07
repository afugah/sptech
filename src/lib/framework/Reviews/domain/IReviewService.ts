import { type IReview } from '@/src/lib/framework/Reviews/domain/entities/IReview';
import { type IReviewScore } from '@/src/lib/framework/Reviews/domain/entities/IReviewScore';
import { type IReviewParams } from '@/src/lib/framework/Reviews/types/IReviewParams';

export interface IReviewService {
  getScore: (productId: string) => Promise<IReviewScore | null>;

  getReviews: (productId: string, params?: IReviewParams) => Promise<IReview[]>;
}
