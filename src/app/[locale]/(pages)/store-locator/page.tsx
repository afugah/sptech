import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React from 'react';
import { PayloadLivePreviewProvider } from '@/src/components/payload/LivePreviewProvider';
import { StoreLocatorLivePreview } from '@/src/components/store-locator/StoreLocatorLivePreview';
import { di } from '@/src/lib/di';
import { StoreService } from '@/src/lib/framework/Store/services/StoreService';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string; city?: string; storeType?: string }>;
};

const FindStorePage: React.FC<Props> = async (props) => {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;

  const storeService = di.resolve(StoreService);
  const stores = await storeService.getStores({
    country: searchParams.country && searchParams.country !== 'all' ? searchParams.country : undefined,
    city: searchParams.city || undefined,
    storeType: searchParams.storeType && searchParams.storeType !== 'all' ? searchParams.storeType : undefined,
  });

  return (
    <PayloadLivePreviewProvider
      config={{
        collection: 'stores',
        id: 'store-locator',
      }}
    >
      <StoreLocatorLivePreview
        initialStores={stores}
        locale={locale}
        initialFilters={{
          country: searchParams.country || 'all',
          storeType: searchParams.storeType || 'all',
          city: searchParams.city || '',
        }}
      />
    </PayloadLivePreviewProvider>
  );
};

export default FindStorePage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/store-locator`;

  return {
    title: t('metadata.stores'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
