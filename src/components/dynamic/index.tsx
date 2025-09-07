/**
 * Dynamic Component Loading
 *
 * Phase 4: Bundle optimization through dynamic imports
 * This module provides lazy-loaded components to reduce initial bundle size
 */

import dynamic from 'next/dynamic';
import { type ComponentType } from 'react';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className={'flex items-center justify-center p-8'}>
    <div className={'h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'}></div>
  </div>
);

// Heavy components that benefit from lazy loading
export const DynamicGoogleMaps = dynamic(
  () => import('@react-google-maps/api').then((mod) => ({ default: mod.GoogleMap })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
);

export const DynamicReactPlayer = dynamic(() => import('react-player'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export const DynamicConfetti = dynamic(() => import('../ui/Confetti'), {
  loading: () => <div />,
  ssr: false,
});

// Simplified dynamic imports to avoid build issues

// Bundle size optimization wrapper
export function withDynamicImport<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: () => React.JSX.Element;
    ssr?: boolean;
  } = {},
) {
  return dynamic(importFunc, {
    loading: options.loading || (() => <LoadingSpinner />),
    ssr: options.ssr !== false,
  });
}

// Utility for conditional loading based on feature flags
export function withConditionalLoading<T = {}>(
  condition: boolean,
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback: ComponentType<T>,
) {
  if (!condition) {
    return fallback;
  }

  return dynamic(importFunc, {
    loading: () => <LoadingSpinner />,
  });
}
