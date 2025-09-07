'use client';

import { useStoreLocatorLivePreview } from '@/src/hooks/usePayloadLivePreview';
import { type IStore } from '@/src/lib/framework/Store/domain/entities/IStore';
import FindStore from '@/src/templates/findStore';
import { MapProvider } from '@/src/templates/findStore/map-provider';

interface StoreLocatorLivePreviewProps {
  initialStores: { [country: string]: IStore[] };
  locale: string;
  initialFilters: {
    country: string;
    storeType: string;
    city: string;
  };
}

/**
 * Store Locator component with PayloadCMS live preview functionality
 *
 * This component integrates with PayloadCMS live preview to show real-time
 * updates to store data and configuration in preview mode.
 */
export const StoreLocatorLivePreview: React.FC<StoreLocatorLivePreviewProps> = ({
  initialStores,
  locale,
  initialFilters,
}) => {
  // Use live preview hook to get real-time store data
  const { data: stores, isLivePreview, isLoading } = useStoreLocatorLivePreview(initialStores);

  // Show loading state during live preview updates
  if (isLivePreview && isLoading) {
    return (
      <MapProvider>
        <div className={'container mx-auto px-4 py-8'}>
          <div className={'flex min-h-[400px] items-center justify-center'}>
            <div className={'text-center'}>
              <div className={'mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-black'} />
              <p className={'text-sm text-gray-600'}>Updating store data...</p>
            </div>
          </div>
        </div>
      </MapProvider>
    );
  }

  // Show live preview indicator when in preview mode
  const previewBanner = isLivePreview && (
    <div className={'bg-blue-100 border-blue-500 mb-6 border-l-4 p-4'}>
      <div className={'flex items-center'}>
        <div className={'flex-shrink-0'}>
          <div className={'bg-blue-500 h-2 w-2 animate-pulse rounded-full'} />
        </div>
        <div className={'ml-3'}>
          <p className={'text-blue-700 text-sm'}>
            <strong>Live Preview Mode:</strong> Content will update automatically as you edit in PayloadCMS
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <MapProvider>
      {previewBanner}
      <FindStore stores={stores} locale={locale} initialFilters={initialFilters} />
    </MapProvider>
  );
};
