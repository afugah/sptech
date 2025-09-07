# Cache Invalidation System Instructions

## Overview

This document provides comprehensive instructions for using the tag-based cache invalidation system implemented as part of the SP Tech optimization project. The system provides automatic and manual cache invalidation for Storyblok content using Next.js 15's `revalidateTag` functionality.

## System Architecture

The cache invalidation system consists of:

- **Multi-tier caching** with `unstable_cache` for Storyblok content
- **Strategic TanStack Query caching** with optimized cache timing
- **Tag-based invalidation** using Next.js `revalidateTag`
- **Webhook endpoints** for automatic cache revalidation
- **Manual API endpoints** for debugging and testing
- **Programmatic utilities** for application-level cache management
- **Client-side query invalidation** for TanStack Query caches

## Cache Tags Structure

### Available Cache Tags

The system supports multiple cache layers with different tag systems:

#### TanStack Query Cache Keys (Client-side)
| Key Prefix | Description | Use Case |
|------------|-------------|----------|
| `cms-content` | CMS content queries | Pages, articles, static content |
| `navigation` | Navigation queries | Headers, menus, footers |
| `products` | Product data queries | Product details, listings |
| `search-results` | Search queries | Product search, filtering |
| `cart` | Shopping cart queries | Cart state, session data |
| `user-profile` | User data queries | Profile, preferences |
| `categories` | Category queries | Product categories |
| `inventory` | Stock queries | Real-time inventory |
| `pricing` | Price queries | Dynamic pricing |

#### ISR Tags (Legacy)
| Tag | Description |
|-----|-------------|
| `products` | Product data and inventory |
| `categories` | Product categories |
| `collections` | Product collections |
| `cms-content` | General CMS content |
| `navigation` | Navigation and menus |
| `search-results` | Search results |
| `inventory` | Stock levels |
| `pricing` | Product pricing |
| `seo-data` | SEO metadata |

#### Storyblok Cache Tags (New)
| Tag | Description | Content Types |
|-----|-------------|---------------|
| `cms-content` | General CMS content | Pages, landing pages, general content |
| `cms-navigation` | Navigation and menu content | Headers, footers, menus, navigation |
| `cms-products` | Product-related content | Products, categories, listings |
| `cms-global` | Global settings and configuration | Site settings, SEO defaults, GTM config |
| `cms-reference` | Reference content | Size guides, diamond information, care instructions |

### Cache Configuration

```typescript
// Static content (pages, navigation) - 1 hour cache
STATIC_CONTENT: {
  revalidate: 3600, // 1 hour
  tags: ['cms-content'],
}

// Navigation and global content - 30 minutes cache
NAVIGATION: {
  revalidate: 1800, // 30 minutes
  tags: ['cms-navigation'],
}

// Product-related content - 5 minutes cache
PRODUCT_CONTENT: {
  revalidate: 300, // 5 minutes
  tags: ['cms-content', 'cms-products'],
}

// Global settings - 2 hours cache
GLOBAL_SETTINGS: {
  revalidate: 7200, // 2 hours
  tags: ['cms-global'],
}

// Reference content - 1 hour cache
REFERENCE_CONTENT: {
  revalidate: 3600, // 1 hour
  tags: ['cms-content', 'cms-reference'],
}
```

## Automatic Cache Invalidation

### Unified Webhook System

The system uses a single webhook endpoint that handles multiple sources: Storyblok, Brink Commerce, and manual revalidation.

1. **Configure Webhook in Storyblok**
   ```
   Webhook URL: https://your-domain.com/api/webhooks/revalidate
   Secret: Set WEBHOOK_REVALIDATION_SECRET environment variable
   Events: Story published, unpublished, deleted
   ```

2. **Environment Variables**
   ```bash
   # Required for webhook authentication (timing-safe comparison)
   WEBHOOK_REVALIDATION_SECRET=your-webhook-secret-here
   ```

3. **Webhook Behavior**
   - Automatically detects webhook source (Storyblok, Brink, manual)
   - Determines cache tags based on both component type AND slug pattern
   - Invalidates both ISR tags (legacy) and new granular Storyblok cache tags
   - Uses Edge Runtime for optimal performance
   - Logs all invalidation actions for debugging
   - Provides JSON response with invalidated tags and timestamp

### Automatic Tag Detection

The system automatically determines which cache tags to invalidate based on:

**Slug patterns:**
- `navigation/*`, `menu/*`, `header/*`, `footer/*` → `cms-navigation`
- `product/*`, `category/*` → `cms-products` 
- `size-guide/*`, `diamond-information/*` → `cms-reference`
- `global/*`, `settings/*`, `config/*` → `cms-global`
- Everything else → `cms-content`

**Component types:**
- `navigation`, `menu`, `header`, `footer` → `cms-navigation`
- `product`, `category`, `product-listing` → `cms-products`
- `size-guide`, `diamond-information`, `reference` → `cms-reference`
- `global`, `settings`, `config` → `cms-global`

## Manual Cache Invalidation

### API Endpoint

**Endpoint:** `POST /api/cache/invalidate`

**Authentication:** Bearer token (required in production)
```bash
# Set environment variable
CACHE_INVALIDATION_API_KEY=your-api-key-here

# Request headers
Authorization: Bearer your-api-key-here
```

### Invalidation Types

#### 1. Invalidate Specific Tags

```bash
curl -X POST https://your-domain.com/api/cache/invalidate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tags",
    "targets": ["cms-navigation", "cms-products"],
    "reason": "Navigation menu updated"
  }'
```

#### 2. Invalidate Specific Paths

```bash
curl -X POST https://your-domain.com/api/cache/invalidate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "paths",
    "targets": ["/en-us", "/sv-se/products"],
    "reason": "Homepage content updated"
  }'
```

#### 3. Invalidate All Caches

```bash
curl -X POST https://your-domain.com/api/cache/invalidate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "all",
    "reason": "Site-wide content update"
  }'
```

#### 4. Clear Memory Cache Only

```bash
curl -X POST https://your-domain.com/api/cache/invalidate \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "memory",
    "reason": "Clear edge cache"
  }'
```

### Get Cache Status

```bash
curl -X GET https://your-domain.com/api/cache/invalidate \
  -H "Authorization: Bearer your-api-key"
```

**Response:**
```json
{
  "status": "active",
  "memory_cache": {
    "size": 45,
    "maxSize": 1000,
    "keys": ["storyblok:navigation/main-menu:en-us:published", ...]
  },
  "available_tags": {
    "storyblok": ["cms-content", "cms-navigation", "cms-products", "cms-global", "cms-reference"],
    "isr": ["products", "categories", "collections", "cms-content", "navigation", "search-results", "inventory", "pricing", "seo-data"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Programmatic Cache Invalidation

### Import Utilities

```typescript
import {
  invalidateStoryblokComponent,
  invalidateStoryblokSlug,
  invalidatePaths,
  invalidateAllStoryblokCache,
  withCacheInvalidation,
} from '@/src/lib/cache/cache-invalidation';
```

### Usage Examples

#### 1. Invalidate by Component Type

```typescript
// Invalidate navigation components
invalidateStoryblokComponent('navigation', {
  reason: 'Menu structure updated',
  includeMemoryCache: true
});

// Invalidate product components
invalidateStoryblokComponent('product', {
  reason: 'Product data updated'
});
```

#### 2. Invalidate by Slug Pattern

```typescript
// Invalidate based on story slug
invalidateStoryblokSlug('global/site-settings', {
  reason: 'Site configuration changed'
});

// Invalidate navigation content
invalidateStoryblokSlug('navigation/main-menu', {
  reason: 'Main navigation updated'
});
```

#### 3. Invalidate Specific Paths

```typescript
// Invalidate homepage
invalidatePaths(['/en-us', '/sv-se'], {
  reason: 'Homepage content updated'
});

// Invalidate product pages
invalidatePaths(['/en-us/products/rings', '/sv-se/produkter/ringar'], {
  reason: 'Product category updated'
});
```

#### 4. Invalidate All Caches

```typescript
// Clear all Storyblok caches
invalidateAllStoryblokCache({
  reason: 'Major content restructure',
  includeMemoryCache: true
});
```

#### 5. Cache Invalidation Middleware

```typescript
// Wrap API handlers with automatic cache invalidation
const updateProductHandler = withCacheInvalidation(
  async (productData) => {
    // Update product logic here
    await updateProduct(productData);
  },
  {
    tags: ['cms-products'],
    paths: ['/products'],
    reason: 'Product updated via API'
  }
);
```

## TanStack Query Cache Integration

### Query Invalidation Patterns

The system now includes automatic TanStack Query cache invalidation alongside server-side cache invalidation:

```typescript
import { INVALIDATION_PATTERNS } from '@/src/lib/tanstack-query/hooks';

// Invalidate product-related queries (both server and client)
INVALIDATION_PATTERNS.products.forEach(queryKey => {
  queryClient.invalidateQueries({ queryKey: [queryKey] });
});

// Available invalidation patterns:
// - INVALIDATION_PATTERNS.products
// - INVALIDATION_PATTERNS.cart  
// - INVALIDATION_PATTERNS.user
// - INVALIDATION_PATTERNS.search
// - INVALIDATION_PATTERNS.navigation
```

### Strategic Cache Timing Integration

The TanStack Query system works alongside Storyblok caching with coordinated timing:

```typescript
// Storyblok cache (server-side) + TanStack Query cache (client-side)
// Static content: 1 hour server + 30 min client
// Product data: 5 min server + 5 min client
// Real-time data: 30 sec server + 30 sec client
```

### Using Strategic Query Hooks

Replace generic useQuery calls with strategic hooks that automatically invalidate coordinated with server caches:

```typescript
// CMS content with automatic cache coordination
const { data: pageData } = useStaticContent(
  'about-us',
  'en-us', 
  () => fetchPageContent('about-us', 'en-us')
);

// Product data with background refresh
const { data: product } = useProductData(
  productId,
  marketCode,
  () => fetchProduct(productId, marketCode)
);

// Cart data with real-time updates
const { data: cart } = useCartData(
  sessionId,
  () => fetchCart(sessionId)
);
```

### Mutation Integration

Mutations automatically invalidate both server and client caches:

```typescript
// Add to cart with automatic cache invalidation
const addToCartMutation = useAddToCartMutation();

// Configure the mutation function
const mutation = {
  ...addToCartMutation,
  mutationFn: async (item) => {
    return await addItemToCart(item);
  },
};

// On success, automatically invalidates:
// - Server: cart-related ISR tags  
// - Client: cart, session, checkout query caches
```

## Cache Warming

### Manual Cache Warming

```typescript
import { warmStoryblokCacheForLocale } from '@/src/lib/storyblok/cache-warming';

// Warm cache for specific locale
await warmStoryblokCacheForLocale('en-us');

// Warm cache for all locales
const locales = ['en-us', 'sv-se', 'no-no', 'da-dk', 'fi-fi'];
await warmStoryblokCacheForAllLocales(locales);
```

### Smart Cache Warming

```typescript
import { smartCacheWarming } from '@/src/lib/storyblok/cache-warming';

// Warm popular content based on analytics
const popularSlugs = ['home', 'products/bestsellers', 'about'];
await smartCacheWarming(popularSlugs, 'en-us', {
  maxConcurrent: 5,
  priority: 'background'
});
```

### Critical Content Warming

```typescript
// Critical content is automatically warmed on application start
// Includes: navigation, global settings, homepage, reference content
const results = await warmStoryblokCacheForLocale('en-us');
console.log(`Warmed ${results.success.length} items, failed ${results.failed.length}`);
```

## Monitoring and Debugging

### Logging

All cache invalidation actions are logged with:
- Action type (tag, path, component, slug)
- Target identifier 
- Reason for invalidation
- Timestamp
- Memory cache statistics

### Debug Information

**Check webhook status:**
```bash
curl -X GET https://your-domain.com/api/webhooks/revalidate
```

**Monitor cache statistics:**
```bash
curl -X GET https://your-domain.com/api/cache/invalidate
```

### Common Debug Scenarios

1. **Content not updating:** Check if webhook is configured correctly and firing
2. **Memory usage high:** Monitor cache statistics and clear memory cache if needed
3. **Performance issues:** Review cache timing configuration and warming strategies
4. **Invalid content:** Use manual invalidation to force refresh specific content

## Best Practices

### 1. Webhook Configuration
- Always use HTTPS for webhook URLs
- Set strong webhook secret and rotate regularly
- Monitor webhook delivery in Storyblok dashboard

### 2. Manual Invalidation
- Use specific tags rather than clearing all caches
- Include descriptive reasons for debugging
- Test invalidation in staging before production

### 3. Programmatic Usage
- Use component-based invalidation when possible
- Include memory cache invalidation for immediate effect
- Implement error handling for cache operations

### 4. Performance Optimization
- Warm critical content proactively
- Use background warming for non-critical content
- Monitor cache hit rates and adjust timing
- Use strategic TanStack Query hooks for coordinated caching
- Enable performance logging for slow query detection

### 5. Security
- Protect manual invalidation API with strong authentication
- Use environment variables for sensitive configuration
- Monitor invalidation logs for unusual activity

## Troubleshooting

### Common Issues

**Webhook not firing:**
- Verify webhook URL is accessible
- Check webhook secret configuration
- Review Storyblok webhook delivery logs

**Content not invalidating:**
- Verify cache tags are correctly assigned
- Check if content matches slug patterns
- Use manual invalidation to test system

**Performance degradation:**
- Monitor memory cache size
- Review cache timing configuration
- Check for excessive invalidation frequency
- Review TanStack Query cache statistics in DevTools
- Check for slow queries in performance logs

**Authentication errors:**
- Verify API key configuration
- Check authorization header format
- Ensure environment variables are set

### Support

For additional support or questions about the cache invalidation system:
1. Check application logs for detailed error messages
2. Use manual invalidation API to test specific scenarios
3. Monitor cache statistics for performance insights
4. Review webhook delivery logs in Storyblok dashboard
5. Use TanStack Query DevTools to inspect client-side cache state
6. Review TanStack Query optimization documentation at `/documentation/performance/TANSTACK_QUERY.md`