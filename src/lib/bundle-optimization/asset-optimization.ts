/**
 * Phase 4: Bundle Optimization - Asset Optimization Utilities
 *
 * Provides optimized asset loading, preloading strategies, and performance
 * monitoring for static assets on Vercel Edge Network.
 */

// Critical resource hints for browser optimization
export const ResourceHints = {
  // Preload critical assets
  preloadCriticalAssets() {
    if (typeof window === 'undefined') return;

    const criticalAssets = [
      // Critical fonts
      { href: '/fonts/efva-attling-regular.woff2', as: 'font', type: 'font/woff2' },
      { href: '/fonts/efva-attling-bold.woff2', as: 'font', type: 'font/woff2' },

      // Critical CSS
      { href: '/_next/static/css/app/[locale]/layout.css', as: 'style' },

      // Hero images (if consistent across pages)
      { href: '/images/hero-background.webp', as: 'image' },
    ];

    criticalAssets.forEach((asset) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset.href;
      link.as = asset.as;
      if (asset.type) link.type = asset.type;
      if (asset.as === 'font') link.crossOrigin = 'anonymous';

      document.head.appendChild(link);
    });
  },

  // Prefetch likely navigation targets
  prefetchRoutes(routes: string[]) {
    if (typeof window === 'undefined') return;

    routes.forEach((route) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  },

  // DNS prefetch for external domains
  dnsPrefetch() {
    if (typeof window === 'undefined') return;

    const domains = [
      'a.storyblok.com',
      'cdn.shoplab.io',
      'shoplab.b-cdn.net',
      'd13fz3ub690kw1.cloudfront.net',
      'www.googletagmanager.com',
    ];

    domains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  },
};

// Image optimization utilities
export const ImageOptimization = {
  // Generate optimized Next.js Image props
  getOptimizedImageProps(
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      priority?: boolean;
      sizes?: string;
    } = {},
  ) {
    const {
      width = 800,
      height = 600,
      quality = 85,
      priority = false,
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    } = options;

    return {
      src,
      width,
      height,
      quality,
      priority,
      sizes,
      placeholder: 'blur' as const,
      blurDataURL: this.generateBlurDataURL(width, height),
      loading: priority ? ('eager' as const) : ('lazy' as const),
    };
  },

  // Generate blur placeholder for images
  generateBlurDataURL(width: number, height: number): string {
    const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
    if (!canvas) {
      // Fallback SVG blur placeholder for SSR
      const svgString = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
        </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
  },

  // Lazy load images with intersection observer
  createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return null;
    }

    return new IntersectionObserver(callback, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });
  },
};

// Font optimization
export const FontOptimization = {
  // Preload critical fonts
  preloadFonts() {
    ResourceHints.preloadCriticalAssets();
  },

  // Font display optimization
  getFontFaceCSS() {
    return `
      @font-face {
        font-family: 'SP Tech';
        src: url('/fonts/efva-attling-regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      
      @font-face {
        font-family: 'SP Tech';
        src: url('/fonts/efva-attling-bold.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `;
  },
};

// CSS optimization utilities
export const CSSOptimization = {
  // Critical CSS extraction helper
  getCriticalCSS() {
    return {
      // Above-the-fold styles
      layout: `
        body { margin: 0; font-family: 'SP Tech', sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      `,

      // Header styles
      header: `
        header { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e5e7eb; }
        nav { display: flex; align-items: center; justify-content: between; padding: 1rem; }
      `,

      // Loading states
      loading: `
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `,
    };
  },

  // Remove unused CSS classes (simplified version)
  purgeUnusedCSS(css: string, usedClasses: string[]): string {
    // This is a simplified implementation
    // In a real scenario, you'd use tools like PurgeCSS
    const usedClassesSet = new Set(usedClasses);

    return css
      .split('\n')
      .filter((line) => {
        const classMatch = line.match(/\.([a-zA-Z0-9_-]+)/);
        if (classMatch) {
          return usedClassesSet.has(classMatch[1]);
        }
        return true;
      })
      .join('\n');
  },
};

// Performance monitoring for assets
export const AssetPerformance = {
  // Monitor asset loading times
  trackAssetLoad(assetType: string, assetUrl: string, loadTime: number) {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`asset-${assetType}-loaded`);

      // Send to analytics
      if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', 'asset_load_time', {
          event_category: 'Performance',
          event_label: assetType,
          value: Math.round(loadTime),
          custom_parameter_1: assetUrl,
        });
      }
    }
  },

  // Monitor Core Web Vitals
  measureCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      if (window.gtag) {
        window.gtag('event', 'LCP', {
          event_category: 'Web Vitals',
          value: Math.round(lastEntry.startTime),
        });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (window.gtag && 'processingStart' in entry) {
          const fidEntry = entry as PerformanceEventTiming;
          window.gtag('event', 'FID', {
            event_category: 'Web Vitals',
            value: Math.round(fidEntry.processingStart - fidEntry.startTime),
          });
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value || 0;
        }
      }

      if (window.gtag) {
        window.gtag('event', 'CLS', {
          event_category: 'Web Vitals',
          value: Math.round(clsValue * 1000),
        });
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // CLS not supported
    }
  },

  // Bundle size monitoring
  monitorBundleSize() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('_next/static/chunks/')) {
          const size = (entry as PerformanceResourceTiming).transferSize;
          const chunkName = entry.name.split('/').pop() || 'unknown';

          this.trackAssetLoad('chunk', chunkName, entry.duration);

          // Warn about large chunks
          if (size > 244000) {
            // 244KB threshold
            console.warn(`Large chunk detected: ${chunkName} (${Math.round(size / 1024)}KB)`);
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch {
      // Resource timing not supported
    }
  },
};

// Service Worker utilities for asset caching
export const ServiceWorkerOptimization = {
  // Register service worker for asset caching
  registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.warn('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError);
        });
    });
  },

  // Cache strategy configuration
  getCacheStrategies() {
    return {
      // Static assets - cache first
      staticAssets: {
        urlPattern: /\/_next\/static\/.*/,
        strategy: 'CacheFirst',
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 31536000, // 1 year
        },
      },

      // Images - stale while revalidate
      images: {
        urlPattern: /\.(jpg|jpeg|png|webp|avif|svg)$/,
        strategy: 'StaleWhileRevalidate',
        cacheName: 'images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 2592000, // 30 days
        },
      },

      // API responses - network first
      api: {
        urlPattern: /\/api\/.*/,
        strategy: 'NetworkFirst',
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300, // 5 minutes
        },
      },
    };
  },
};

// Initialize optimizations
export function initializeAssetOptimizations() {
  if (typeof window === 'undefined') return;

  // Preload critical assets
  ResourceHints.preloadCriticalAssets();

  // DNS prefetch
  ResourceHints.dnsPrefetch();

  // Monitor performance
  AssetPerformance.measureCoreWebVitals();
  AssetPerformance.monitorBundleSize();

  // Register service worker in production
  if (process.env.NODE_ENV === 'production') {
    ServiceWorkerOptimization.registerServiceWorker();
  }
}

// Type declarations
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const assetOptimization = {
  ResourceHints,
  ImageOptimization,
  FontOptimization,
  CSSOptimization,
  AssetPerformance,
  ServiceWorkerOptimization,
  initializeAssetOptimizations,
};

export default assetOptimization;
