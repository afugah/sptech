export const dynamic = 'force-dynamic';

import { type Metadata } from 'next';
import React from 'react';
import Wishlist from '@/src/components/ui/sheet/components/wishlist';

const WishListPage = async () => {
  return <Wishlist />;
};

export default WishListPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  //   const t = await getTranslations({ locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/wishlist`;

  return {
    title: 'wishlist',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
