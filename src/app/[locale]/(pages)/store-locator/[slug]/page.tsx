import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { di } from '@/src/lib/di';
import { StoreService } from '@/src/lib/framework/Store/services/StoreService';
import { MapProvider } from '@/src/templates/findStore/map-provider';
import { StoreDetailContent } from '@/src/templates/findStore/StoreDetailContent';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function StoreDetailPage(props: Props) {
  const params = await props.params;

  const storeService = di.resolve(StoreService);
  const allStores = await storeService.getStores();

  let foundStore = null;
  for (const countryStores of Object.values(allStores)) {
    foundStore = countryStores.find((s) => s.slug === params.slug) || null;
    if (foundStore) break;
  }

  if (!foundStore) {
    notFound();
  }

  return (
    <MapProvider>
      <StoreDetailContent store={foundStore} />
    </MapProvider>
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale });
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.locale}/store-locator/${params.slug}`;

  return {
    title: t('metadata.stores'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
