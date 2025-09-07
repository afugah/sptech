'use client';

import { useMarketAutoDetection } from '@/src/hooks/useMarketAutoDetection';

/**
 * Client component that handles automatic market detection
 * Should be placed high in the component tree to run early
 */
export default function MarketAutoDetector() {
  // This hook handles all the auto-detection logic
  useMarketAutoDetection();

  // This component doesn't render anything visible
  return null;
}
