import Star from '@images/icons/star.svg';
import classNames from 'classnames';

interface IRatingStarsProps {
  rating: number;

  totalStars?: number;
}

export const RatingStars: React.FC<IRatingStarsProps> = ({ rating, totalStars = 5 }) => (
  <div className={'flex flex-row flex-nowrap'}>
    {Array.from({ length: totalStars }).map((_, index) => {
      const isFullStar = index + 1 <= rating;
      const isHalfStar = index + 1 > rating && index + 1 < rating + 1;
      const isEmptyStar = index + 1 > rating;

      return (
        <div className={'relative'} key={index}>
          <Star
            className={classNames('fill-current h-5 w-5', {
              'fill-current': isFullStar,
              'text-gray-300': isEmptyStar || isHalfStar,
            })}
          />

          {isHalfStar && (
            <div className={'absolute left-0 top-0 h-5 w-1/2 overflow-hidden'}>
              <Star className={'fill-current h-5 w-5'} />
            </div>
          )}
        </div>
      );
    })}
  </div>
);
