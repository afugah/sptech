'use client';

import { useEffect, useState } from 'react';
import { RatingStars } from '@/src/components/product/page/RatingStars';
import { ReviewDrawerReview } from '@/src/components/product/page/ReviewDrawer/components/Review';
import { Drawer } from '@/src/components/ui/Drawer';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';
import { type IReview } from '@/src/lib/framework/Reviews/domain/entities/IReview';
import { type IReviewScore } from '@/src/lib/framework/Reviews/domain/entities/IReviewScore';
import { getProductReviews } from '../action';

interface IReviewDrawerProps {
  rating: IReviewScore;
  open: boolean;
  ean?: string;
  onClose: () => void;
  product: IProduct;
}

export const ReviewDrawer: React.FC<IReviewDrawerProps> = ({ open, ean, product, onClose, ...props }) => {
  const { title } = product;
  const { rating, reviewsCount, voteCount } = props.rating;

  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<IReview[]>([]);
  useEffect(() => {
    if (ean) {
      getProductReviews(ean)
        .then(setReviews)
        .finally(() => setIsLoading(false));
    }
  }, [ean]);
  return (
    <Drawer open={open} onClose={onClose} title={'Reviews'} subtitle={title}>
      <div className={'px-14'}>
        <div className={'flex items-center gap-2'}>
          <p className={'font-serif text-5xl'}>{rating}</p>

          <RatingStars rating={rating} />
        </div>

        <p className={'text-xs'}>
          Based on {voteCount} ratings and {reviewsCount} reviews
        </p>
      </div>

      <div className={'px-14'}>True to size</div>

      {isLoading ? (
        <div>Loading...</div>
      ) : reviews.length ? (
        <div className={'flex flex-col gap-5 px-14'}>
          {reviews.map((review) => (
            <ReviewDrawerReview key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className={'px-14 text-secondary'}>No reviews yet</p>
      )}
    </Drawer>
  );
};
