'use client';

import classNames from 'classnames';
import { Button } from '@/components/shadcn/button';

export interface IAmountProps {
  amount: number;
  setAmount: (amount: number) => void;
  min?: number;
  max?: number;

  loading?: boolean;
  disabled?: boolean;

  className?: string;
}

export const Amount: React.FC<IAmountProps> = (props) => {
  const {
    amount,
    setAmount: updateQuantity,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    loading = false,
    className,
  } = props;

  return (
    <div className={''}>
      <div
        className={classNames(
          ' relative flex  h-10 w-auto  flex-row flex-nowrap items-center gap-px overflow-hidden border border-gray-300 lg:h-12',
          className,
        )}
      >
        {/* {loading && <Loader overlay={'rgba(250, 249, 248, 0.8)'} inverted />} */}

        <Button
          variant={'custom'}
          type={'button'}
          className={classNames('')}
          onClick={() => updateQuantity(amount - 1)}
          disabled={loading || amount <= min}
        >
          <p className={'text-2xl text-gray-600'}>-</p>
        </Button>

        <p
          className={`flex h-full min-w-10  items-center  justify-center border border-y-0 border-gray-300 bg-transparent text-center text-lg text-black ${loading && 'text-gray-700'}`}
        >
          {amount}
        </p>

        <Button
          variant={'custom'}
          type={'button'}
          className={classNames('')}
          onClick={() => updateQuantity(amount + 1)}
          disabled={loading || amount >= max}
        >
          <p className={'text-lg text-gray-600'}>+</p>
        </Button>
      </div>
    </div>
  );
};
