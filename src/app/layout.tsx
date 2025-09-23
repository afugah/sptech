import { type Metadata } from 'next';
import localFont from 'next/font/local';
import { type PropsWithChildren } from 'react';

const sohne = localFont({
  src: [
    {
      path: '../fonts/sohnebuchLeicht.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/sohnebuch.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/sohnebuchKraftig.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/sohnebuchHalbfett.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/sohnebuchDreiviertelfett.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sohne',
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || 'SP Tech',
};

interface IProps extends PropsWithChildren {}

const RootLayout: React.FC<IProps> = ({ children }) => {
  return (
    <html suppressHydrationWarning className={sohne.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
};

export default RootLayout;
