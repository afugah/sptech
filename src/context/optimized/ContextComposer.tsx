'use client';

import React, { type ComponentType, type ReactNode } from 'react';

/**
 * Context Composer utility to reduce provider nesting
 * Combines multiple providers into a single component for better performance and readability
 */

type ProviderComponent = ComponentType<{ children: ReactNode }>;

interface ProviderConfig {
  Provider: ProviderComponent;
  props?: Record<string, unknown>;
}

interface ContextComposerProps {
  providers: (ProviderComponent | ProviderConfig)[];
  children: ReactNode;
}

/**
 * Composes multiple context providers into a single nested structure
 * This reduces the component tree depth and improves rendering performance
 */
export const ContextComposer: React.FC<ContextComposerProps> = ({ providers, children }) => {
  return providers.reduceRight<ReactNode>((acc, provider) => {
    if (typeof provider === 'function') {
      // Simple provider component
      const Provider = provider;
      return <Provider>{acc}</Provider>;
    } else {
      // Provider with props
      const { Provider, props = {} } = provider;
      return <Provider {...props}>{acc}</Provider>;
    }
  }, children) as React.ReactElement;
};

/**
 * Hook-based composer for conditional providers
 * Allows providers to be conditionally included based on runtime conditions
 */
interface ConditionalProviderConfig extends ProviderConfig {
  condition?: boolean;
}

interface ConditionalContextComposerProps {
  providers: ConditionalProviderConfig[];
  children: ReactNode;
}

export const ConditionalContextComposer: React.FC<ConditionalContextComposerProps> = ({ providers, children }) => {
  const activeProviders = providers.filter((provider) => provider.condition !== false);

  return <ContextComposer providers={activeProviders}>{children}</ContextComposer>;
};

/**
 * Higher-order component that creates a composed provider
 * Useful for creating reusable provider compositions
 */
export function createComposedProvider(providers: (ProviderComponent | ProviderConfig)[]) {
  const ComposedProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ContextComposer providers={providers}>{children}</ContextComposer>
  );

  ComposedProvider.displayName = 'ComposedProvider';
  return ComposedProvider;
}

/**
 * Utility to create lazy-loaded provider compositions
 * Providers are only loaded when actually needed
 */
interface LazyProviderConfig {
  loader: () => Promise<{ default: ProviderComponent }>;
  fallback?: ReactNode;
  props?: Record<string, unknown>;
}

interface LazyContextComposerProps {
  providers: LazyProviderConfig[];
  children: ReactNode;
}

export const LazyContextComposer: React.FC<LazyContextComposerProps> = ({ providers, children }) => {
  return providers.reduceRight<ReactNode>((acc, { loader, fallback, props = {} }) => {
    const LazyProvider = React.lazy(loader);
    return (
      <React.Suspense fallback={fallback || null}>
        <LazyProvider {...props}>{acc}</LazyProvider>
      </React.Suspense>
    );
  }, children) as React.ReactElement;
};

/**
 * Performance-optimized composer that memoizes provider trees
 * Prevents unnecessary re-renders when provider props don't change
 */
export const MemoizedContextComposer: React.FC<ContextComposerProps> = React.memo(({ providers, children }) => {
  // Memoize the entire provider tree
  const memoizedTree = React.useMemo(() => {
    return providers.reduceRight<ReactNode>((acc, provider) => {
      if (typeof provider === 'function') {
        const Provider = provider;
        return <Provider>{acc}</Provider>;
      } else {
        const { Provider, props = {} } = provider;
        return <Provider {...props}>{acc}</Provider>;
      }
    }, children);
  }, [providers, children]);

  return memoizedTree as React.ReactElement;
});

MemoizedContextComposer.displayName = 'MemoizedContextComposer';

/**
 * Context group utility for organizing related providers
 * Helps with code organization and conditional loading of provider groups
 */
export interface ContextGroup {
  name: string;
  providers: (ProviderComponent | ProviderConfig)[];
  condition?: boolean;
}

interface GroupedContextComposerProps {
  groups: ContextGroup[];
  children: ReactNode;
}

export const GroupedContextComposer: React.FC<GroupedContextComposerProps> = ({ groups, children }) => {
  const activeGroups = groups.filter((group) => group.condition !== false);
  const allProviders = activeGroups.flatMap((group) => group.providers);

  return <ContextComposer providers={allProviders}>{children}</ContextComposer>;
};

/**
 * Utility functions for common provider patterns
 */
export const ProviderUtils = {
  /**
   * Creates a provider config with props
   */
  withProps: (Provider: ProviderComponent, props: Record<string, unknown>): ProviderConfig => ({
    Provider,
    props,
  }),

  /**
   * Creates a conditional provider
   */
  conditional: (
    Provider: ProviderComponent,
    condition: boolean,
    props?: Record<string, unknown>,
  ): ConditionalProviderConfig => ({
    Provider,
    props,
    condition,
  }),

  /**
   * Creates a group of providers
   */
  group: (name: string, providers: (ProviderComponent | ProviderConfig)[], condition?: boolean): ContextGroup => ({
    name,
    providers,
    condition,
  }),
};

/**
 * Development utilities
 */
export const DevUtils = {
  /**
   * Provider that logs when it mounts/unmounts (development only)
   */
  withLogging: (Provider: ProviderComponent, name: string): ProviderComponent => {
    if (process.env.NODE_ENV !== 'development') {
      return Provider;
    }

    const LoggingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      React.useEffect(() => {
        console.warn(`[ContextComposer] ${name} provider mounted`);
        return () => {
          console.warn(`[ContextComposer] ${name} provider unmounted`);
        };
      }, []);

      return <Provider>{children}</Provider>;
    };

    LoggingProvider.displayName = `LoggingProvider(${name})`;
    return LoggingProvider;
  },

  /**
   * Provider that measures render time (development only)
   */
  withPerformanceMonitoring: (Provider: ProviderComponent, name: string): ProviderComponent => {
    if (process.env.NODE_ENV !== 'development') {
      return Provider;
    }

    const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
      const performanceAPI = typeof window !== 'undefined' && 'performance' in window ? window.performance : undefined;
      const renderStart = performanceAPI ? performanceAPI.now() : Date.now();

      React.useLayoutEffect(() => {
        const renderEnd = performanceAPI ? performanceAPI.now() : Date.now();
        console.warn(`[ContextComposer] ${name} render time: ${renderEnd - renderStart}ms`);
      });

      return <Provider>{children}</Provider>;
    };

    PerformanceProvider.displayName = `PerformanceProvider(${name})`;
    return PerformanceProvider;
  },
};
