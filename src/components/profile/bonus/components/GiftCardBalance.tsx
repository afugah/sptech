'use client';
import React, { useState } from 'react';
import { InputVariantEnum } from '@/src/components/ui/Input/constants';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input'; // Assuming this is where your custom Input is located

const GiftCardBalance: React.FC = () => {
  const [code, setCode] = useState('');

  const handleCheckBalance = () => {
    // Logic to check balance can be added here
  };

  return (
    <div className={'container flex flex-col items-center gap-y-16 pb-6'}>
      <div className={'mt-12 w-full max-w-[529px] text-center'}>
        <h2 className={'mb-4 font-serif text-3xl'}>Gift card balance</h2>
        <p className={'mb-6 font-sans text-gray-600'}>16-digit code (e.g., 1234567890123456) *</p>
        <div className={'flex items-center justify-center gap-4 max-md:flex-col'}>
          <Input
            label={'Type in code'}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputVariant={InputVariantEnum.Underline}
            className={'w-80'}
          />
          <Button
            className={'max-md:w-full'}
            buttonType={Button.Type.Filled}
            buttonColor={Button.Color.Dark}
            onClick={handleCheckBalance}
          >
            See Balance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GiftCardBalance;
