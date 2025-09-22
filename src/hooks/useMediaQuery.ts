import { useEffect, useState } from 'react';

/**
 * Custom hook for media query matching
 * Returns true if the media query matches the current viewport
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Return false during SSR
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Common breakpoints following Tailwind CSS conventions
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hook for responsive behavior with predefined breakpoints
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2Xl = useMediaQuery(breakpoints['2xl']);

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    // Helper methods
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
  };
}

/**
 * Hook specifically for mobile detection
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook for detecting user preferences
 */
export function useUserPreferences() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');

  return {
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
  };
}

/**
 * Hook for touch device detection
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(hasTouch);
  }, []);

  return isTouchDevice;
}

/**
 * Hook for iOS detection (useful for safe area handling)
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  return isIOS;
}

/**
 * Hook for getting responsive image sizes
 * Returns appropriate sizes string for next/image
 */
export function useResponsiveImageSizes() {
  const { isMobile, isTablet } = useBreakpoint();

  return {
    galleryMain: isMobile ? '100vw' : isTablet ? '80vw' : '60vw',
    galleryThumbnail: '64px',
    productCard: isMobile ? '(max-width: 640px) 50vw' : isTablet ? '(max-width: 1024px) 33vw' : '25vw',
    hero: '100vw',
  };
}

/**
 * Hook for dynamic viewport height (useful for mobile address bar)
 */
export function useViewportHeight() {
  const [vh, setVh] = useState('100vh');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateVh = () => {
      // Use dvh if supported, fallback to vh
      const supportsDvh = CSS.supports('height', '100dvh');
      setVh(supportsDvh ? '100dvh' : '100vh');
    };

    updateVh();
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);

    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, []);

  return vh;
}
