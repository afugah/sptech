/**
 * ISR Configuration for Phase 3: Enhanced Static Generation
 *
 * Defines revalidation strategies and static generation rules
 * for optimal Vercel Edge Network performance.
 */

// ISR Revalidation Times (in seconds)
export const ISR_REVALIDATION = {
  // Product pages - frequent updates for inventory/pricing
  PRODUCT_PAGES: 300, // 5 minutes

  // Category pages - moderate updates for new products
  CATEGORY_PAGES: 1800, // 30 minutes

  // Collection pages - similar to categories
  COLLECTION_PAGES: 1800, // 30 minutes

  // CMS content pages - infrequent updates
  CMS_PAGES: 3600, // 1 hour

  // Search result pages - dynamic but can be cached briefly
  SEARCH_PAGES: 900, // 15 minutes

  // Homepage and key landing pages
  LANDING_PAGES: 1800, // 30 minutes

  // Navigation and global data
  NAVIGATION: 3600, // 1 hour

  // Sitemap and SEO pages
  SITEMAP: 21600, // 6 hours
} as const;

// Static Generation Priorities
export const STATIC_GENERATION_LIMITS = {
  // Top products to pre-generate per locale
  TOP_PRODUCTS_PER_LOCALE: 100,

  // All category pages (usually smaller number)
  ALL_CATEGORY_PAGES: true,

  // Popular search terms to pre-generate
  POPULAR_SEARCH_TERMS: 50,

  // Key landing pages
  KEY_LANDING_PAGES: [
    '', // Homepage
    'collections',
    'categories',
    'sale',
    'new-arrivals',
    'bestsellers',
  ],
} as const;

// ISR Tags for targeted cache invalidation
export const ISR_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
  CMS_CONTENT: 'cms-content',
  NAVIGATION: 'navigation',
  SEARCH: 'search-results',
  INVENTORY: 'inventory',
  PRICING: 'pricing',
  SEO: 'seo-data',
} as const;

// Page type detection for dynamic ISR configuration
export function getISRConfigForPage(slug: string[]): {
  revalidate: number;
  tags: string[];
  forceStatic?: boolean;
} {
  const joinedSlug = slug.join('/');

  // Product pages (assuming they have specific patterns)
  if (isProductPage(joinedSlug)) {
    return {
      revalidate: ISR_REVALIDATION.PRODUCT_PAGES,
      tags: [ISR_TAGS.PRODUCTS, ISR_TAGS.INVENTORY, ISR_TAGS.PRICING],
    };
  }

  // Category pages
  if (isCategoryPage(joinedSlug)) {
    return {
      revalidate: ISR_REVALIDATION.CATEGORY_PAGES,
      tags: [ISR_TAGS.CATEGORIES, ISR_TAGS.PRODUCTS],
    };
  }

  // Collection pages
  if (isCollectionPage(joinedSlug)) {
    return {
      revalidate: ISR_REVALIDATION.COLLECTION_PAGES,
      tags: [ISR_TAGS.COLLECTIONS, ISR_TAGS.PRODUCTS],
    };
  }

  // Search pages
  if (isSearchPage(joinedSlug)) {
    return {
      revalidate: ISR_REVALIDATION.SEARCH_PAGES,
      tags: [ISR_TAGS.SEARCH, ISR_TAGS.PRODUCTS],
    };
  }

  // Homepage and key landing pages
  if (isLandingPage(joinedSlug)) {
    return {
      revalidate: ISR_REVALIDATION.LANDING_PAGES,
      tags: [ISR_TAGS.CMS_CONTENT, ISR_TAGS.NAVIGATION],
      forceStatic: true,
    };
  }

  // Default CMS pages
  return {
    revalidate: ISR_REVALIDATION.CMS_PAGES,
    tags: [ISR_TAGS.CMS_CONTENT],
  };
}

// Helper functions to detect page types
function isProductPage(slug: string): boolean {
  // Product pages typically have specific patterns like:
  // - jewelry/rings/diamond-ring-123
  // - products/necklace-456
  return /\/(jewelry|products|accessories)\/.*\/[^/]+$/.test(slug) || /^[^/]+\/[^/]+\/[^/]+$/.test(slug); // Three-level deep pages are often products
}

function isCategoryPage(slug: string): boolean {
  // Category pages like: jewelry/rings, accessories/earrings
  return /^(jewelry|accessories|collections?)\/[^/]+$/.test(slug);
}

function isCollectionPage(slug: string): boolean {
  // Collection pages like: collections/summer-2024, sale/jewelry
  return /^(collections?|sale|new-arrivals|bestsellers)/.test(slug);
}

function isSearchPage(slug: string): boolean {
  return slug.includes('search') || slug.includes('find');
}

function isLandingPage(slug: string): boolean {
  return (STATIC_GENERATION_LIMITS.KEY_LANDING_PAGES as readonly string[]).includes(slug) || slug === '';
}

// Build-time static generation configuration
export const BUILD_TIME_GENERATION = {
  // Only generate in production builds
  ENABLED_IN_DEVELOPMENT: false,

  // Maximum build time for static generation (to prevent timeouts)
  MAX_BUILD_TIME_MINUTES: 15,

  // Batch size for parallel generation
  GENERATION_BATCH_SIZE: 20,

  // Fail gracefully if generation errors
  CONTINUE_ON_ERROR: true,
} as const;
