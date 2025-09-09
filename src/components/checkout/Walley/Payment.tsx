'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isPaymentProviderEnabled } from '@/src/lib/features';

interface PaymentProps {
  publicToken?: string;
  onPaymentComplete?: () => void;
  onError?: (error: string) => void;
}

export const Payment: React.FC<PaymentProps> = ({ publicToken, onPaymentComplete, onError }) => {
  const walleyContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPaymentProviderEnabled('WALLEY')) {
      setError('Walley payment provider is not enabled');
      onError?.('Walley payment provider is not enabled');
      return;
    }

    if (!publicToken) {
      setError('No Walley token provided');
      onError?.('No Walley token provided');
      return;
    }

    const initializeWalley = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Walley checkout widget
        // Note: This would typically load Walley's JavaScript SDK
        // For now, we'll create a placeholder that shows the token

        if (walleyContainerRef.current) {
          walleyContainerRef.current.innerHTML = `
            <div style="padding: 20px; border: 1px solid #ddd; border-radius: 4px;">
              <h3>Walley Payment</h3>
              <p>Token: ${publicToken}</p>
              <p>Payment widget would be loaded here</p>
              <button 
                onclick="window.handleWalleyPayment?.()" 
                style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;"
              >
                Complete Payment
              </button>
            </div>
          `;

          // Mock payment completion handler
          (window as Record<string, unknown>).handleWalleyPayment = () => {
            onPaymentComplete?.();
          };
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Walley payment';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
    };

    initializeWalley();

    // Cleanup
    return () => {
      (window as Record<string, unknown>).handleWalleyPayment = undefined;
    };
  }, [publicToken, onPaymentComplete, onError]);

  if (!isPaymentProviderEnabled('WALLEY')) {
    return (
      <div className={'walley-payment-error'}>
        <p>Walley payment is not available</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={'walley-payment-error'}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={'walley-payment-loading'}>
        <p>Loading Walley payment...</p>
      </div>
    );
  }

  return (
    <div className={'walley-payment-container'}>
      <div ref={walleyContainerRef} id={'walley-checkout-container'} />
    </div>
  );
};
