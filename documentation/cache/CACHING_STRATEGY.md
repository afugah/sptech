# Caching Strategy

## Overview

The SP Tech platform implements a **comprehensive multi-layer caching strategy** designed to maximize performance, minimize API calls, and provide optimal user experience across all markets and devices.

---

## 🏗️ **Caching Architecture**

### **Multi-Layer Cache System**
```
User Request → Browser Cache → CDN Cache → Edge Cache → Server Cache → Database
               ↓              ↓           ↓            ↓             ↓
           Local Storage  → Vercel Edge → ISR Cache → API Cache → Query Cache
```

### **Cache Layers Overview**
1. **Browser Cache** - Client-side caching (Service Worker, HTTP cache)
2. **CDN Cache** - Vercel Edge Network global caching
3. **ISR Cache** - Next.js Incremental Static Regeneration
4. **API Cache** - Server-side API response caching
5. **Query Cache** - TanStack Query client-side caching
6. **Database Cache** - External API response caching

---

## 🔄 **TanStack Query Caching**

### **Strategic Cache Timing by Data Type**
```typescript
// Cache timing configuration by data characteristics
export const CACHE_TIMINGS = {
  // Static content (changes infrequently)
  STATIC_CONTENT: {
    staleTime: 1000 * 60 * 30,      // 30 minutes
    gcTime: 1000 * 60 * 60 * 2,     // 2 hours
  },
  
  // Navigation content (medium change frequency)
  NAVIGATION: {
    staleTime: 1000 * 60 * 15,      // 15 minutes
    gcTime: 1000 * 60 * 60,         // 1 hour
  },
  
  // Product data (frequent inventory updates)
  PRODUCT_DATA: {
    staleTime: 1000 * 60 * 5,       // 5 minutes
    gcTime: 1000 * 60 * 30,         // 30 minutes
  },
  
  // Real-time data (pricing, inventory)
  REAL_TIME: {
    staleTime: 1000 * 30,           // 30 seconds
    gcTime: 1000 * 60 * 5,          // 5 minutes
  },
  
  // User-specific data (profiles, preferences)
  USER_SPECIFIC: {
    staleTime: 1000 * 60 * 2,       // 2 minutes
    gcTime: 1000 * 60 * 10,         // 10 minutes
  },
  
  // Search results (medium freshness needs)
  SEARCH_RESULTS: {
    staleTime: 1000 * 60 * 3,       // 3 minutes
    gcTime: 1000 * 60 * 15,         // 15 minutes
  },
  
  // Cart/session data (critical for UX)
  CART_SESSION: {
    staleTime: 1000 * 60,           // 1 minute
    gcTime: 1000 * 60 * 5,          // 5 minutes
  },
  
  // Analytics data (background priority)
  ANALYTICS: {
    staleTime: 1000 * 60 * 60,      // 1 hour
    gcTime: 1000 * 60 * 60 * 4,     // 4 hours
  }
};
```

### **Query Client Configuration**
```typescript
// Optimized TanStack Query configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults
      staleTime: CACHE_TIMINGS.STATIC_CONTENT.staleTime,
      gcTime: CACHE_TIMINGS.STATIC_CONTENT.gcTime,
      
      // Network optimization
      networkMode: 'online',
      retry: (failureCount, error) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    }
  }
});
```

---

## 🌐 **Next.js ISR (Incremental Static Regeneration)**

### **ISR Configuration**
```typescript
// Page-level ISR configuration
export const revalidate = 3600; // 1 hour

// Dynamic ISR based on content type
export async function generateStaticParams() {
  return [
    { slug: 'homepage', revalidate: 1800 },    // 30 minutes
    { slug: 'products', revalidate: 900 },     // 15 minutes
    { slug: 'collections', revalidate: 1800 }, // 30 minutes
  ];
}
```

### **On-Demand Revalidation**
```typescript
// Manual cache invalidation
export async function POST(request: NextRequest) {
  const { path, tags } = await request.json();
  
  try {
    // Path-based revalidation
    if (path) {
      await revalidatePath(path);
    }
    
    // Tag-based revalidation
    if (tags) {
      for (const tag of tags) {
        await revalidateTag(tag);
      }
    }
    
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
```

---

## 🏷️ **Cache Tags Strategy**

### **Hierarchical Cache Tags**
```typescript
// Cache tag organization
export const CACHE_TAGS = {
  // Global tags
  GLOBAL: {
    NAVIGATION: 'navigation',
    FOOTER: 'footer',
    CONFIG: 'site-config'
  },
  
  // Content tags
  CONTENT: {
    HOMEPAGE: 'homepage',
    PRODUCT_PAGE: (id: string) => `product-${id}`,
    COLLECTION_PAGE: (id: string) => `collection-${id}`,
    CMS_PAGE: (slug: string) => `cms-${slug}`
  },
  
  // Data tags
  DATA: {
    PRODUCT: (id: string) => `product-data-${id}`,
    INVENTORY: (id: string) => `inventory-${id}`,
    PRICING: (id: string) => `pricing-${id}`,
    SEARCH: (query: string) => `search-${btoa(query)}`
  },
  
  // User-specific tags
  USER: {
    CART: (sessionId: string) => `cart-${sessionId}`,
    PROFILE: (userId: string) => `profile-${userId}`,
    WISHLIST: (userId: string) => `wishlist-${userId}`
  }
};
```

### **Smart Cache Invalidation**
```typescript
// Intelligent cache invalidation based on data relationships
async function invalidateRelatedCaches(entity: string, id: string) {
  const invalidationMap = {
    product: [
      CACHE_TAGS.DATA.PRODUCT(id),
      CACHE_TAGS.DATA.INVENTORY(id),
      CACHE_TAGS.DATA.PRICING(id),
      CACHE_TAGS.CONTENT.PRODUCT_PAGE(id),
      'search-results', // All search results might include this product
      'product-recommendations'
    ],
    collection: [
      CACHE_TAGS.CONTENT.COLLECTION_PAGE(id),
      'navigation', // Collections might be in navigation
      'homepage'    // Homepage might feature this collection
    ],
    inventory: [
      CACHE_TAGS.DATA.INVENTORY(id),
      CACHE_TAGS.DATA.PRODUCT(id), // Product data includes inventory
      'search-results' // Search results show availability
    ]
  };
  
  const tagsToInvalidate = invalidationMap[entity] || [];
  
  for (const tag of tagsToInvalidate) {
    await revalidateTag(tag);
  }
}
```

---

## 🔧 **API Response Caching**

### **Response Cache Headers**
```typescript
// Cache headers for different content types
export const CACHE_HEADERS = {
  STATIC_ASSETS: {
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
  },
  DYNAMIC_CONTENT: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1 hour + SWR
  },
  USER_SPECIFIC: {
    'Cache-Control': 'private, max-age=300', // 5 minutes, private
  },
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
};

// Apply cache headers to API responses
export function withCacheHeaders(response: NextResponse, cacheType: keyof typeof CACHE_HEADERS) {
  const headers = CACHE_HEADERS[cacheType];
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}
```

### **Memory Cache for Hot Paths**
```typescript
// In-memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
```

---

## 🌊 **Stale-While-Revalidate Pattern**

### **SWR Implementation**
```typescript
// Custom SWR hook for critical data
export function useSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number;
    maxAge?: number;
    revalidateOnFocus?: boolean;
  } = {}
) {
  const {
    staleTime = 60000,     // 1 minute
    maxAge = 300000,       // 5 minutes
    revalidateOnFocus = true
  } = options;
  
  return useQuery({
    queryKey: [key],
    queryFn: fetcher,
    staleTime,
    gcTime: maxAge,
    refetchOnWindowFocus: revalidateOnFocus,
    refetchOnMount: 'always'
  });
}
```

### **Background Refresh Strategy**
```typescript
// Background refresh for critical data
export async function prefetchCriticalData() {
  const criticalQueries = [
    'navigation',
    'homepage-content',
    'featured-products',
    'current-promotions'
  ];
  
  await Promise.allSettled(
    criticalQueries.map(queryKey =>
      queryClient.prefetchQuery({
        queryKey: [queryKey],
        queryFn: () => fetchData(queryKey),
        staleTime: CACHE_TIMINGS.STATIC_CONTENT.staleTime
      })
    )
  );
}
```

---

## 📱 **Client-Side Storage Strategy**

### **Local Storage Management**
```typescript
// Strategic local storage usage
export const LocalStorageKeys = {
  USER_PREFERENCES: 'user-preferences',
  CART_BACKUP: 'cart-backup',
  RECENT_SEARCHES: 'recent-searches',
  VIEWED_PRODUCTS: 'viewed-products',
  CURRENCY_PREFERENCE: 'currency-preference'
} as const;

// Local storage with expiration
export class ExpiringStorage {
  static set(key: string, value: any, ttl: number) {
    const item = {
      value,
      expires: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
  
  static get(key: string) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      
      if (item.expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }
}
```

### **Session Storage for Temporary Data**
```typescript
// Session storage for temporary UI state
export const SessionStorageManager = {
  // Filter state preservation
  saveFilters: (filters: FilterState) => {
    sessionStorage.setItem('current-filters', JSON.stringify(filters));
  },
  
  loadFilters: (): FilterState | null => {
    const stored = sessionStorage.getItem('current-filters');
    return stored ? JSON.parse(stored) : null;
  },
  
  // Shopping journey tracking
  saveSearchJourney: (journey: SearchJourney) => {
    sessionStorage.setItem('search-journey', JSON.stringify(journey));
  },
  
  // Form data preservation
  saveFormData: (formId: string, data: any) => {
    sessionStorage.setItem(`form-${formId}`, JSON.stringify(data));
  }
};
```

---

## 🔄 **Cache Warming Strategies**

### **Predictive Cache Warming**
```typescript
// Intelligent cache warming based on user behavior
export class CacheWarmer {
  static async warmForMarket(market: string) {
    const marketQueries = [
      `navigation-${market}`,
      `homepage-${market}`,
      `featured-collections-${market}`,
      `currency-rates-${market}`
    ];
    
    await Promise.allSettled(
      marketQueries.map(queryKey =>
        queryClient.prefetchQuery({
          queryKey: [queryKey],
          queryFn: () => fetchMarketData(queryKey, market)
        })
      )
    );
  }
  
  static async warmForProduct(productId: string) {
    // Warm related data when user views a product
    const relatedQueries = [
      `product-details-${productId}`,
      `product-reviews-${productId}`,
      `related-products-${productId}`,
      `product-recommendations-${productId}`
    ];
    
    await Promise.allSettled(
      relatedQueries.map(queryKey =>
        queryClient.prefetchQuery({
          queryKey: [queryKey],
          queryFn: () => fetchProductData(queryKey, productId),
          staleTime: CACHE_TIMINGS.PRODUCT_DATA.staleTime
        })
      )
    );
  }
}
```

### **Service Worker Caching**
```typescript
// Service worker for offline-first caching
const CACHE_NAME = 'efva-attling-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Critical CSS and JS files
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

---

## 📊 **Cache Performance Monitoring**

### **Cache Hit Rate Tracking**
```typescript
// Monitor cache performance
export class CacheMetrics {
  private static hits = 0;
  private static misses = 0;
  
  static recordHit(cacheType: string) {
    this.hits++;
    // Send to analytics
    this.trackMetric('cache_hit', { type: cacheType });
  }
  
  static recordMiss(cacheType: string) {
    this.misses++;
    // Send to analytics
    this.trackMetric('cache_miss', { type: cacheType });
  }
  
  static getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }
  
  private static trackMetric(event: string, data: any) {
    // Send to your analytics platform
    gtag('event', event, data);
  }
}
```

### **Cache Size Monitoring**
```typescript
// Monitor cache sizes to prevent memory issues
export function monitorCacheSize() {
  // TanStack Query cache size
  const queryCache = queryClient.getQueryCache();
  const queryCacheSize = queryCache.getAll().length;
  
  // Local storage usage
  const localStorageUsage = JSON.stringify(localStorage).length;
  
  // Report metrics
  reportMetrics({
    queryCacheSize,
    localStorageUsage: localStorageUsage / 1024, // KB
    timestamp: Date.now()
  });
  
  // Clear cache if too large
  if (queryCacheSize > 1000) {
    queryClient.clear();
  }
}
```

---

## 🎯 **Cache Optimization Best Practices**

### **Key Performance Guidelines**
1. **Aggressive Static Caching**: Cache static content for hours/days
2. **Smart Dynamic Caching**: Cache dynamic content with appropriate TTL
3. **User-Specific Isolation**: Never cache user-specific data globally
4. **Graceful Degradation**: Always have fallbacks for cache misses
5. **Proactive Warming**: Warm critical paths before user interaction

### **Common Anti-Patterns to Avoid**
- ❌ Caching user-specific data with global keys
- ❌ Using same TTL for all content types
- ❌ Not implementing cache invalidation
- ❌ Ignoring cache size limits
- ❌ Over-caching volatile data

---

This comprehensive caching strategy ensures optimal performance while maintaining data freshness and user experience quality across the SP Tech platform.