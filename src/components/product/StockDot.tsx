import classNames from 'classnames';
import React from 'react';

interface StockDotProps {
  dotColor: string | null | undefined;
  className?: string;
  size?: 'small' | 'medium';
}

/**
 * Reusable stock indicator dot component
 * Displays a colored circle based on stock status
 */
export const StockDot: React.FC<StockDotProps> = ({ dotColor, className, size = 'small' }) => {
  if (!dotColor) return null;

  const sizeClasses = {
    small: 'h-2 w-2',
    medium: 'h-3 w-3',
  };

  return (
    <span
      className={classNames(
        'inline-block rounded-full',
        sizeClasses[size],
        {
          'bg-green': dotColor === 'green',
          'bg-orange': dotColor === 'yellow',
          'bg-red': dotColor === 'red',
        },
        className,
      )}
      aria-hidden
    />
  );
};

export default StockDot;
