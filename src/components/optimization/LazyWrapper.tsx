/**
 * Phase 4: Bundle Optimization - Lazy Loading Wrapper
 *
 * Provides optimized lazy loading with loading states, error boundaries,
 * and performance monitoring for Vercel Edge Network.
 */

'use client';

import { type ComponentType, type ReactNode, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  chunkName?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Default loading skeleton
function DefaultSkeleton() {
  return (
    <div className={'animate-pulse'}>
      <div className={'space-y-4'}>
        <div className={'h-4 w-3/4 rounded bg-gray-200'}></div>
        <div className={'h-4 w-1/2 rounded bg-gray-200'}></div>
        <div className={'h-4 w-5/6 rounded bg-gray-200'}></div>
      </div>
    </div>
  );
}

// Default error fallback
function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className={'border-red-200 bg-red-50 rounded-lg border p-4'}>
      <h3 className={'text-red-800 mb-2 text-lg font-medium'}>Something went wrong</h3>
      <p className={'mb-4 text-red-600'}>
        {error.message || 'An unexpected error occurred while loading this component.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className={'hover:bg-red-700 rounded bg-red-600 px-4 py-2 text-white transition-colors'}
      >
        Try again
      </button>
    </div>
  );
}

// Performance monitoring
function trackLazyLoad(chunkName: string, loadTime: number, priority: string) {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(`lazy-${chunkName}-loaded`);

    // Track in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[LazyWrapper] ${chunkName} loaded in ${loadTime}ms (${priority} priority)`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'lazy_component_load', {
        event_category: 'Performance',
        event_label: chunkName,
        value: Math.round(loadTime),
        custom_parameter_1: priority,
      });
    }
  }
}

export function LazyWrapper({
  children,
  fallback = <DefaultSkeleton />,
  errorFallback = DefaultErrorFallback,
  chunkName = 'unknown',
  priority = 'medium',
}: LazyWrapperProps) {
  const startTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();

  const handleLoad = () => {
    const loadTime = (typeof window !== 'undefined' ? window.performance.now() : Date.now()) - startTime;
    trackLazyLoad(chunkName, loadTime, priority);
  };

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload();
      }}
      onError={(error) => {
        console.error(`[LazyWrapper] Error in ${chunkName}:`, error);

        // Send error to monitoring service
        if (process.env.NODE_ENV === 'production' && window.gtag) {
          window.gtag('event', 'exception', {
            description: `Lazy component error: ${chunkName}`,
            fatal: false,
          });
        }
      }}
    >
      <Suspense fallback={<div onLoad={handleLoad}>{fallback}</div>}>
        <div onLoad={handleLoad}>{children}</div>
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for easier usage
export function withLazyWrapper<P extends object>(
  Component: ComponentType<P>,
  options: Omit<LazyWrapperProps, 'children'> = {},
) {
  const WrappedComponent = (props: P) => (
    <LazyWrapper {...options}>
      <Component {...props} />
    </LazyWrapper>
  );

  WrappedComponent.displayName = `withLazyWrapper(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Intersection Observer based lazy loading for below-the-fold components
export function LazyOnView({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  ...wrapperProps
}: LazyWrapperProps & {
  threshold?: number;
  rootMargin?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, inView] = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  return (
    <div ref={ref}>
      {isVisible ? (
        <LazyWrapper {...wrapperProps}>{children}</LazyWrapper>
      ) : (
        wrapperProps.fallback || <DefaultSkeleton />
      )}
    </div>
  );
}

// Hook for dynamic imports with caching
export function useDynamicImport<T>(importFn: () => Promise<{ default: T }>, _deps: React.DependencyList = []) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        const startTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
        const importedModule = await importFn();
        const loadTime = (typeof window !== 'undefined' ? window.performance.now() : Date.now()) - startTime;

        if (mounted) {
          setComponent(importedModule.default);
          trackLazyLoad('dynamic-import', loadTime, 'medium');
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [importFn]);

  return { component, loading, error };
}

// Preload utility for critical components
export function preloadComponent(importFn: () => Promise<unknown>) {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduler =
    (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ||
    ((cb: () => void) => setTimeout(cb, 1));

  scheduler(() => {
    importFn().catch((error) => {
      console.warn('[LazyWrapper] Failed to preload component:', error);
    });
  });
}

// Type declarations for global interfaces
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default LazyWrapper;
