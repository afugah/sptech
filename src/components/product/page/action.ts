'use server';

import { di } from '@/src/lib/di';
import { type IReview } from '@/src/lib/framework/Reviews/domain/entities/IReview';
import { type IReviewScore } from '@/src/lib/framework/Reviews/domain/entities/IReviewScore';
import { ReviewService } from '@/src/lib/framework/Reviews/services/ReviewService';

export const getProductReviewScore = async (ean: string): Promise<IReviewScore | null> => {
  const productService = di.resolve(ReviewService);
  return productService.getScore(ean);
};
export const getProductReviews = async (ean: string): Promise<IReview[]> => {
  const productService = di.resolve(ReviewService);
  return productService.getReviews(ean);
};
