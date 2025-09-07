import DiscountCodeIcon from '@images/icons/tag.svg';
import CloseIcon from '@images/icons/xmark.svg';
import debounce from 'lodash.debounce';
import React, { useMemo, useState } from 'react';
import Loader from '@/src/components/ui/Loader';
import { useCheckout } from '@/src/context/checkoutContext';
import { type CartDiscountCode } from '@/src/lib/types/session';

interface Props {
  discountCode: CartDiscountCode;
}

export default function DiscountCode({ discountCode }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { deleteDiscountCode } = useCheckout();

  const onDelete = useMemo(() => {
    return debounce(() => {
      setIsLoading(true);
      return deleteDiscountCode(discountCode.code).then(() => setIsLoading(false));
    }, 500);
  }, [discountCode.code, deleteDiscountCode]);

  return (
    <li
      className={
        'mb-2.5 flex cursor-pointer items-center justify-between bg-gray-200 px-4 py-2 text-xl font-bold last:mb-0'
      }
      key={discountCode.code}
      onClick={() => onDelete()}
    >
      {isLoading && <Loader overlay={'rgba(255, 255, 255, 0.8)'} inverted />}
      <span className={'flex items-center gap-2'}>
        <DiscountCodeIcon width={'20'} /> {discountCode.code}
      </span>
      <CloseIcon />
    </li>
  );
}
