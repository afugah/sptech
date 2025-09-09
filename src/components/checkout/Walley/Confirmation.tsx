'use client';

import React from 'react';

interface ConfirmationProps {
  orderNumber?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    paymentMethod: string;
  };
}

export const Confirmation: React.FC<ConfirmationProps> = ({ orderNumber, paymentDetails }) => {
  return (
    <div className={'walley-confirmation'}>
      <div className={'confirmation-header'}>
        <h2>Payment Confirmed</h2>
        <div className={'success-icon'}>✓</div>
      </div>

      <div className={'confirmation-details'}>
        {orderNumber && (
          <div className={'order-info'}>
            <h3>Order Details</h3>
            <p>
              <strong>Order Number:</strong> {orderNumber}
            </p>
          </div>
        )}

        {paymentDetails && (
          <div className={'payment-info'}>
            <h3>Payment Information</h3>
            <p>
              <strong>Amount:</strong> {paymentDetails.amount} {paymentDetails.currency}
            </p>
            <p>
              <strong>Payment Method:</strong> Walley ({paymentDetails.paymentMethod})
            </p>
          </div>
        )}

        <div className={'next-steps'}>
          <h3>What&apos;s Next?</h3>
          <ul>
            <li>You will receive a confirmation email shortly</li>
            <li>Your order will be processed within 1-2 business days</li>
            <li>You can track your order in your account</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .walley-confirmation {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .confirmation-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .confirmation-header h2 {
          color: #28a745;
          margin-bottom: 10px;
        }

        .success-icon {
          font-size: 48px;
          color: #28a745;
          background: #d4edda;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .confirmation-details > div {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .confirmation-details h3 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }

        .confirmation-details p {
          margin: 5px 0;
        }

        .next-steps ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .next-steps li {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};
