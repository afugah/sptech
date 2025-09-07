import React from 'react';
import { RatingStars } from '@/src/components/product/page/RatingStars';
import { type IReviewScore } from '@/src/lib/framework/Reviews/domain/entities/IReviewScore';

interface ReviewProps {
  rating: IReviewScore;
  onReviewsClick: () => void;
}

const ReviewComponent: React.FC<ReviewProps> = ({ rating, onReviewsClick }) => {
  return (
    <div className={'mb-5 flex items-center'}>
      <RatingStars rating={rating.rating} />

      <button type={'button'} onClick={onReviewsClick}>
        <span className={'ml-2 cursor-pointer text-sm font-medium text-gray-600 underline'}>
          {rating.reviewsCount} Reviews
        </span>
      </button>
    </div>
  );
};
export default ReviewComponent;
