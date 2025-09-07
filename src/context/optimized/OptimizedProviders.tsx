'use client';

// import { StoryblokProvider } from '@storyblok/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import React, { type ReactNode } from 'react';
import { createStrategicQueryDefaults, createTestingQueryDefaults } from '@/src/lib/tanstack-query/queryConfig';
import { CartCompositeProvider } from './CartCompositeProvider';
import { ContextComposer, type ContextGroup, GroupedContextComposer, ProviderUtils } from './ContextComposer';

/**
 * Optimized providers setup with reduced nesting and better performance
 * Replaces the deeply nested provider hierarchy with a composed structure
 */

// Create a stable QueryClient instance with strategic cache configuration
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: createStrategicQueryDefaults(),
  });

let queryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!queryClient) queryClient = createQueryClient();
    return queryClient;
  }
};

interface OptimizedProvidersProps {
  children: ReactNode;
  session?: unknown;
  storyblokToken?: string;
  enableDevtools?: boolean;
}

// Core provider groups organized by functionality
// Create wrapper components that match the ProviderComponent interface
const QueryClientWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
);
QueryClientWrapper.displayName = 'QueryClientWrapper';

const createProviderGroups = (session: unknown, storyblokToken: string, enableDevtools: boolean): ContextGroup[] => [
  // Data fetching and caching
  ProviderUtils.group('data', [QueryClientWrapper]),

  // Content management (disabled - StoryblokProvider not available)
  // ProviderUtils.group(
  //   'content',
  //   [
  //     ProviderUtils.withProps(StoryblokProvider, {
  //       accessToken: storyblokToken,
  //       use: [], // Add Storyblok components as needed
  //     }),
  //   ],
  //   !!storyblokToken,
  // ),

  // Authentication
  ProviderUtils.group('auth', [
    ({ children }) => <SessionProvider session={session as unknown as { expires: string }}>{children}</SessionProvider>,
  ]),

  // E-commerce state (cart, checkout, etc.)
  ProviderUtils.group('ecommerce', [CartCompositeProvider]),

  // Development tools
  ProviderUtils.group(
    'devtools',
    [() => (enableDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null)],
    enableDevtools && process.env.NODE_ENV === 'development',
  ),
];

// Lazy-loaded provider groups for non-critical functionality
const createLazyProviderGroups = (): ContextGroup[] => [
  // Analytics providers (lazy-loaded)
  ProviderUtils.group(
    'analytics',
    [
      // Add lazy-loaded analytics providers here
    ],
    process.env.NODE_ENV === 'production',
  ),

  // Feature flag providers (lazy-loaded)
  ProviderUtils.group('features', [
    // Add lazy-loaded feature flag providers here
  ]),
];

export const OptimizedProviders: React.FC<OptimizedProvidersProps> = ({
  children,
  session,
  storyblokToken = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || '',
  enableDevtools = process.env.NODE_ENV === 'development',
}) => {
  const providerGroups = React.useMemo(
    () => createProviderGroups(session, storyblokToken, enableDevtools),
    [session, storyblokToken, enableDevtools],
  );

  const lazyProviderGroups = React.useMemo(() => createLazyProviderGroups(), []);

  return (
    <GroupedContextComposer groups={[...providerGroups, ...lazyProviderGroups]}>{children}</GroupedContextComposer>
  );
};

/**
 * Alternative lightweight providers for specific use cases
 */
export const MinimalProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  const minimalProviders = [QueryClientWrapper];

  return <ContextComposer providers={minimalProviders}>{children}</ContextComposer>;
};

/**
 * Testing providers with mock data
 */
export const TestingProviders: React.FC<{
  children: ReactNode;
  mocks?: Record<string, unknown>;
}> = ({ children, mocks: _mocks = {} }) => {
  const testQueryClient = new QueryClient({
    defaultOptions: createTestingQueryDefaults(),
  });

  const TestQueryClientWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );

  const testingProviders = [
    TestQueryClientWrapper,
    // Add mock providers for testing
  ];

  return <ContextComposer providers={testingProviders}>{children}</ContextComposer>;
};

/**
 * Performance monitoring wrapper for development
 */
export const PerformanceOptimizedProviders: React.FC<OptimizedProvidersProps> = (props) => {
  // Add performance monitoring in development
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.includes('React')) {
          console.warn(`[Performance] ${entry.name}: ${entry.duration}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  return <OptimizedProviders {...props} />;
};

export default OptimizedProviders;
