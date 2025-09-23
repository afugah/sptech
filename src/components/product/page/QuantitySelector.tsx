import React, { useState } from 'react';

interface QuantitySelectorProps {
  initialQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  initialQuantity = 1,
  minQuantity = 1,
  maxQuantity = 10,
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  const handleDecrease = () => {
    if (quantity > minQuantity) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(minQuantity, Math.min(maxQuantity, Number(e.target.value)));
    setQuantity(newQuantity);
    onQuantityChange?.(newQuantity);
  };

  return (
    <span className={'flex max-w-36 items-center justify-around space-x-2 rounded-3xl border border-gray-300 p-2'}>
      <button
        title={'-'}
        data-test-id={'decrease-quantity-button'}
        type={'button'}
        className={'rounded bg-white p-2 text-gray-700 hover:bg-gray-300'}
        onClick={handleDecrease}
      >
        <svg width={'1em'} height={'1em'} fill={'#ededed'} viewBox={'0 0 16 14'}>
          <path stroke={'currentColor'} strokeLinecap={'round'} strokeLinejoin={'round'} d={'M15.333 7H.667'}></path>
        </svg>
      </button>
      <input
        type={'number'}
        data-test-id={'quantity-input'}
        style={{ appearance: 'none', MozAppearance: 'textfield' }}
        className={
          'h-[20px] border-none p-0 text-center text-sm outline-none hover:border-none hover:outline-none focus:border-none focus:outline-none'
        }
        value={quantity}
        onChange={handleInputChange}
      />
      <button
        title={'+'}
        data-test-id={'increase-quantity-button'}
        type={'button'}
        className={'rounded bg-white p-2 text-gray-700 hover:bg-gray-300'}
        onClick={handleIncrease}
      >
        <svg width={'1em'} height={'1em'} fill={'#ededed'} viewBox={'0 0 14 14'}>
          <path
            stroke={'currentColor'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
            d={'M7 .583v12.834M13.417 7H.583'}
          ></path>
        </svg>
      </button>
    </span>
  );
};

export default QuantitySelector;
