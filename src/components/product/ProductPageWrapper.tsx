'use client';

import dynamic from 'next/dynamic';

const ProductPageClient = dynamic(() => import('./ProductPageClient'), {
  ssr: false,
  loading: () => (
    <div className={'flex min-h-screen items-center justify-center'}>
      <div className={'text-center'}>
        <h1 className={'text-2xl font-semibold'}>Loading...</h1>
      </div>
    </div>
  ),
});

interface ProductPageWrapperProps {
  locale: string;
  slug: string;
}

export default function ProductPageWrapper(props: ProductPageWrapperProps) {
  return <ProductPageClient {...props} />;
}
