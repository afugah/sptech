import React, { useState } from 'react';

const SizeSelector: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className={'flex max-w-sm flex-col space-y-4 rounded-lg bg-white p-4 shadow-lg'}>
      {/* Size Dropdown Button */}
      <div className={'relative'}>
        <button
          type={'button'}
          className={
            'bg-gray-100 focus:ring-indigo-500 flex w-full items-center justify-between rounded-md px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2'
          }
        >
          <span>Choose size</span>
          <svg width={'1em'} height={'1em'} className={'h-5 w-5 text-gray-500'} fill={'none'} viewBox={'0 0 12 12'}>
            <path
              fill={'currentColor'}
              d={
                'M6 3.282L.84 8.846a.496.496 0 01-.678.039.443.443 0 01-.041-.646l5.34-5.757a.736.736 0 01.54-.232c.205 0 .402.084.538.232l5.34 5.757a.443.443 0 01-.04.646.496.496 0 01-.678-.04L6 3.283z'
              }
            />
          </svg>
        </button>

        {/* Size Options */}
        <div className={'absolute left-0 mt-2 w-full rounded-md bg-white shadow-lg'}>
          {sizes.map((size) => (
            <button
              key={size}
              type={'button'}
              className={`hover:bg-gray-100 flex w-full items-center justify-between px-4 py-2 text-gray-700 ${
                selectedSize === size ? 'bg-gray-200' : ''
              }`}
              onClick={() => setSelectedSize(size)}
            >
              <span>{size}</span>
              {selectedSize === size && <div className={'bg-green-500 h-3 w-3 rounded-full'}></div>}
            </button>
          ))}
        </div>
      </div>

      {/* View Size Guide Button */}
      <button
        type={'button'}
        className={
          'bg-gray-100 focus:ring-indigo-500 flex items-center justify-center rounded-md px-4 py-2 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2'
        }
      >
        <svg width={'1em'} height={'1em'} className={'mr-2 h-5 w-5'} fill={'none'} viewBox={'0 0 16 16'}>
          <path
            stroke={'currentColor'}
            stroke-linecap={'round'}
            stroke-linejoin={'round'}
            d={'M14.708 1.292L1.292 14.708m13.416 0L1.292 1.292'}
          />
        </svg>
        <span>View size guide</span>
      </button>
    </div>
  );
};

export default SizeSelector;
