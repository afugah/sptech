'use client';

// import CheckIcon from '@images/icons/check-circle.svg';
// import InfoIcon from '@images/icons/info.svg';
// import classNames from 'classnames';
// import { useMemo } from 'react';
// import { useCart } from '@/src/context/cartContext';

interface IFreeShippingBannerProps {
  className?: string;
}

export const FreeShippingBanner: React.FC<IFreeShippingBannerProps> = () =>
  // { className }
  {
    // TODO: Add free shipping logic
    return null;
    // const { cart } = useCart();

    // const freeShippingFrom = 500;

    // const total = useMemo(() => cart?.totals.grandTotal || 0, [cart?.totals.grandTotal]);
    // const isFreeShipping = useMemo(() => total > freeShippingFrom, [total]);

    // const Icon = useMemo(() => (isFreeShipping ? CheckIcon : InfoIcon), [isFreeShipping]);

    // return (
    //   <div className={classNames('flex items-center gap-x-2 self-start rounded-md bg-alabaster px-5 py-4', className)}>
    //     <Icon className={'inline-block h-5 w-5 flex-shrink-0'} />

    //     {isFreeShipping ? (
    //       <span>You have qualified for free shipping!</span>
    //     ) : (
    //       <span>Add {freeShippingFrom - total} KR more to qualify for free shipping!</span>
    //     )}
    //   </div>
    // );
  };
