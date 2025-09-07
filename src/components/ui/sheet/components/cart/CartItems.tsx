import React from 'react';

type Props = {
  style: 'text' | 'round';
  numberOfCartItems: number;
};

const CartItems = ({ numberOfCartItems, style }: Props) => {
  if (style === 'text') {
    return <span className={'text-xs font-light'}>({numberOfCartItems})</span>;
  } else if (style === 'round') {
    return (
      <span
        className={
          'text-sans absolute -right-1 -top-2 -mr-1 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-creme text-xs'
        }
      >
        {numberOfCartItems}
      </span>
    );
  }
  return null;
};

export default CartItems;
