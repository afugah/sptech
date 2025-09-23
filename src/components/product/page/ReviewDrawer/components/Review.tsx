'use client';

import { useToggle } from 'usehooks-ts';
import { RatingStars } from '@/src/components/product/page/RatingStars';
import { type IReview } from '@/src/lib/framework/Reviews/domain/entities/IReview';

interface IReviewProps {
  review: IReview;
}

export const ReviewDrawerReview: React.FC<IReviewProps> = ({ review }) => {
  const [isTranslated, toggleIsTranslated] = useToggle(!!review.translatedText);

  return (
    <div className={'flex flex-col gap-4 rounded-md border border-creme bg-white p-4'}>
      <div className={'flex flex-row flex-wrap justify-between'}>
        <p className={'font-semibold'}>{review.user.name}</p>
        <p className={'text-sm'}>{review.date}</p>
      </div>

      <RatingStars rating={review.rating} />

      <p>{isTranslated ? review.translatedText : review.text}</p>

      <p className={'text-sm text-secondary'}>{review.productTitle}</p>

      {!!review.translatedText && (
        <button className={'text-start text-sm uppercase text-secondary'} onClick={toggleIsTranslated}>
          {isTranslated ? 'This is a translation. View original' : 'Translate'}
        </button>
      )}
    </div>
  );
};
