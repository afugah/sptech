import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';

const MANUAL_SELECTION_KEY = 'marketManuallySelected';
const DETECTED_MARKET_KEY = 'detectedMarket';

interface GeolocationResponse {
  location: {
    country: string;
  };
  market: {
    code: string;
    currency: string;
  };
}

/**
 * Hook to automatically detect and redirect to the appropriate market
 * Only runs on first visit or if user hasn't manually selected a market
 */
export const useMarketAutoDetection = () => {
  const router = useRouter();
  const currentLocale = useLocale();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionComplete, setDetectionComplete] = useState(false);

  useEffect(() => {
    const detectAndRedirect = async () => {
      // Check if user has manually selected a market before
      const hasManualSelection = localStorage.getItem(MANUAL_SELECTION_KEY);
      if (hasManualSelection === 'true') {
        setDetectionComplete(true);
        return; // User has made a manual selection, don't auto-redirect
      }

      // Check if we've already detected for this session
      const previousDetection = sessionStorage.getItem(DETECTED_MARKET_KEY);
      if (previousDetection) {
        setDetectionComplete(true);
        return; // Already detected this session
      }

      setIsDetecting(true);

      try {
        // Call geolocation API to detect user's country
        const response = await fetch('/api/edge/geolocation');
        if (!response.ok) {
          throw new Error('Failed to detect location');
        }

        const data: GeolocationResponse = await response.json();
        const detectedMarket = data.market.code;

        // Store that we've done detection for this session
        sessionStorage.setItem(DETECTED_MARKET_KEY, detectedMarket);

        // Only redirect if the detected market differs from current
        if (detectedMarket !== currentLocale) {
          // For 'en' market, we stay at root path
          // For 'se' or 'fi', we need to redirect to the prefixed path
          if (detectedMarket === 'se' || detectedMarket === 'fi') {
            router.replace('/', { locale: detectedMarket });
          }
          // If current locale is not 'en' but detected is 'en', redirect to root
          else if (detectedMarket === 'en' && currentLocale !== 'en') {
            router.replace('/', { locale: 'en' });
          }
        }
      } catch (error) {
        console.error('Failed to auto-detect market:', error);
        // On error, just continue with current market
      } finally {
        setIsDetecting(false);
        setDetectionComplete(true);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      detectAndRedirect();
    }
  }, [currentLocale, router]);

  return {
    isDetecting,
    detectionComplete,
    // Function to mark that user has made a manual selection
    markManualSelection: () => {
      localStorage.setItem(MANUAL_SELECTION_KEY, 'true');
    },
    // Function to clear manual selection (useful for testing)
    clearManualSelection: () => {
      localStorage.removeItem(MANUAL_SELECTION_KEY);
      sessionStorage.removeItem(DETECTED_MARKET_KEY);
    },
  };
};
