import React from 'react';
import { Confirmation } from './Confirmation';
import { Payment } from './Payment';

interface WalleyProps {
  stage: 'payment' | 'confirmation';
  publicToken?: string;
  onPaymentComplete?: () => void;
  onError?: (error: string) => void;
}

export const Walley: React.FC<WalleyProps> = ({ stage, publicToken, onPaymentComplete, onError }) => {
  switch (stage) {
    case 'payment':
      return <Payment publicToken={publicToken} onPaymentComplete={onPaymentComplete} onError={onError} />;
    case 'confirmation':
      return <Confirmation />;
    default:
      return null;
  }
};

export { Confirmation as WalleyConfirmation } from './Confirmation';
export { Payment as WalleyPayment } from './Payment';
