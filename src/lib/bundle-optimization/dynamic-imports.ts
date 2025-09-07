/**
 * Phase 4: Bundle Optimization - Dynamic Imports Configuration
 *
 * Implements advanced code splitting strategies to reduce bundle size
 * and improve initial page load performance on Vercel Edge Network.
 */

// Core dynamic imports for heavy components
// Note: These are placeholder imports for future components
export const DynamicComponents = {
  // Example usage for when components exist:
  // ProductGrid: lazy(() => import('@/components/product/ProductGrid')),
  // ProductFilters: lazy(() => import('@/components/filters/ProductFilters')),
  // ShoppingCart: lazy(() => import('@/components/cart/ShoppingCart')),
};

// Vendor library dynamic imports
// Note: Only import libraries that are actually installed
export const DynamicVendors = {
  // Form libraries (already installed)
  FormValidation: () => import('yup'),

  // Image optimization (Next.js built-in)
  ImageOptimization: () => import('next/image'),

  // Example imports for when libraries are installed:
  // DatePicker: () => import('react-datepicker'),
  // RichTextEditor: () => import('@storyblok/richtext'),
  // Lottie: () => import('lottie-react'),
  // Charts: () => import('recharts'),
};

// Route-based code splitting helpers
// Note: These would be used for route-level code splitting when needed
export const RouteChunks = {
  // Example usage for route-based splitting:
  // authRoutes: () => import('@/app/[locale]/(auth)/layout'),
  // checkoutRoutes: () => import('@/app/[locale]/(checkout)/layout'),
  // successRoutes: () => import('@/app/[locale]/(success)/layout'),
};

// Bundle splitting configuration
export const BundleSplitConfig = {
  // Vendor chunk configuration
  vendors: {
    react: ['react', 'react-dom'],
    nextjs: ['next', 'next-intl'],
    ui: ['@storyblok/react', '@tanstack/react-query'],
    analytics: ['@vercel/analytics', 'gtag'],
    payment: ['@klarna/checkout', 'stripe'],
    maps: ['@google/maps', 'leaflet'],
  },

  // Chunk size limits
  maxChunkSize: 244000, // 244KB - optimal for HTTP/2
  maxAssetSize: 512000, // 512KB

  // Shared chunk configuration
  sharedChunks: {
    common: ['lodash', 'date-fns', 'zod'],
    vendor: ['react', 'react-dom', 'next'],
    ui: ['tailwindcss', '@headlessui/react'],
  },
};

// Preload configuration for critical routes
export const PreloadConfig = {
  // Critical routes to preload
  criticalRoutes: ['/', '/products', '/categories', '/search'],

  // Preload on hover/interaction
  interactionPreload: ['/checkout', '/profile', '/cart'],

  // Prefetch for likely next pages
  prefetchRoutes: ['/product/[slug]', '/category/[slug]'],
};

// Performance monitoring
export const BundleMetrics = {
  // Track bundle loading performance
  trackChunkLoad: (chunkName: string, loadTime: number) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`chunk-${chunkName}-loaded`);

      // Send to analytics if needed
      if (process.env.NODE_ENV === 'production') {
        // Analytics tracking code here - using console.warn to comply with linting
        console.warn(`Chunk ${chunkName} loaded in ${loadTime}ms`);
      }
    }
  },

  // Monitor bundle size impact
  bundleSizeImpact: {
    target: 200, // KB target for initial bundle
    warning: 400, // KB warning threshold
    error: 600, // KB error threshold
  },
};

// Dynamic import helper with error handling
export async function dynamicImport<T>(importFn: () => Promise<T>, fallback?: T, retries = 3): Promise<T> {
  try {
    const startTime = typeof window !== 'undefined' ? window.performance.now() : Date.now();
    const importedModule = await importFn();
    const loadTime = (typeof window !== 'undefined' ? window.performance.now() : Date.now()) - startTime;

    BundleMetrics.trackChunkLoad('dynamic', loadTime);
    return importedModule;
  } catch (error) {
    console.error('Dynamic import failed:', error);

    if (retries > 0) {
      // Retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000));
      return dynamicImport(importFn, fallback, retries - 1);
    }

    if (fallback) {
      return fallback;
    }

    throw error;
  }
}
