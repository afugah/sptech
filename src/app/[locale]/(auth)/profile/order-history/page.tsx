import React from 'react';
import OrderHistoryPage from '@/src/templates/orderHistory/orderHistory';

export const dynamic = 'force-dynamic';

interface IOrderHistoryProps {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ page?: number; q: string }>;
}

const OrderHistory: React.FC<IOrderHistoryProps> = async () => {
  return <OrderHistoryPage />;
};

export default OrderHistory;
