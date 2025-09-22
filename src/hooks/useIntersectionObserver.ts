import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  ref: React.RefObject<Element>;
}

/**
 * Custom hook for observing element intersection with viewport
 * Useful for lazy loading, animations, and performance optimizations
 */
export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}): UseIntersectionObserverReturn {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;

  const elementRef = useRef<Element>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const frozen = freezeOnceVisible && isIntersecting;

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !element) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);
    }, observerParams);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin, frozen]);

  // Fallback for SSR and browsers without IntersectionObserver
  useEffect(() => {
    if (!window.IntersectionObserver) {
      setIsIntersecting(true);
    }
  }, []);

  return {
    isIntersecting,
    entry,
    ref: elementRef,
  };
}

/**
 * Hook specifically for lazy hydration of heavy components
 * Only hydrates when component enters viewport with configurable threshold
 */
export function useLazyHydration(threshold = 0.1) {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
    rootMargin: '50px', // Start loading slightly before entering viewport
  });

  return {
    shouldHydrate: isIntersecting,
    ref,
  };
}

/**
 * Hook for lazy loading images with fade-in effect
 */
export function useLazyImage() {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
    rootMargin: '100px', // Start loading well before entering viewport
  });

  return {
    shouldLoad: isIntersecting,
    ref,
  };
}
