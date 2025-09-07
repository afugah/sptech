import { type Metadata } from 'next';
import { type PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || 'SP Tech',
};

interface IProps extends PropsWithChildren {}

const RootLayout: React.FC<IProps> = ({ children }) => {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
