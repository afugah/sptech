'use client';

import { type ReactNode } from 'react';
import {
  getPreviewDataFromURL,
  isLivePreviewEnabled,
  type PayloadLivePreviewConfig,
} from '@/src/lib/payload/live-preview';

interface PayloadLivePreviewProviderProps {
  children: ReactNode;
  config?: Partial<PayloadLivePreviewConfig>;
}

/**
 * PayloadCMS Live Preview Provider Component
 *
 * Wraps content with PayloadCMS live preview functionality.
 * Automatically configures based on URL parameters and environment.
 *
 * Note: This is a simplified provider that just passes through children.
 * The actual live preview functionality is handled by the useLivePreview hook.
 */
export const PayloadLivePreviewProvider: React.FC<PayloadLivePreviewProviderProps> = ({
  children,
  config: _config = {},
}) => {
  const _isEnabled = isLivePreviewEnabled();
  const _previewData = getPreviewDataFromURL();

  // Store config in context if needed, but for now just pass through
  // The actual live preview logic is handled in the useLivePreview hook
  return <>{children}</>;
};

/**
 * Higher-order component for adding live preview to pages
 */
export function withLivePreview<T extends object>(
  Component: React.ComponentType<T>,
  config?: Partial<PayloadLivePreviewConfig>,
) {
  return function LivePreviewWrappedComponent(props: T) {
    return (
      <PayloadLivePreviewProvider config={config}>
        <Component {...props} />
      </PayloadLivePreviewProvider>
    );
  };
}
