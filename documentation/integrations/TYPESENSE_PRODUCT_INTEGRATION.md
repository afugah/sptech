# Typesense Product Integration

## Overview

This document describes the Typesense integration for fetching product data directly from Typesense search engine, similar to the existing Elasticsearch direct API integration.

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Enable direct Typesense API for product data
NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API=true

# Optional: Gradual rollout percentage (0-100)
NEXT_PUBLIC_TYPESENSE_DIRECT_ROLLOUT=0

# Typesense configuration (already existing)
SEARCH_ENGINE=TYPESENSE
SEARCH_TYPESENSE_HOST=localhost
SEARCH_TYPESENSE_PORT=8108
SEARCH_TYPESENSE_PROTOCOL=http
SEARCH_TYPESENSE_API_KEY=your-api-key
SEARCH_TYPESENSE_COLLECTION=products
SEARCH_TYPESENSE_DEFAULT_LANGUAGE=en
```

## Important: Typesense Data Structure

The Typesense collection has a different data structure than Elasticsearch:

- Product ID is stored in the `id` field (string)
- SKU is stored in the `sku` field (not `product_sku`)
- Title is an object with language keys: `{ "en": "Product Name" }`
- Prices are stored in a nested structure with market keys
- Images are in the `image_url` field
- Variants are in the `variants` array
- Cannot use `id` field in `query_by` - must use `filter_by` instead

## Architecture

### Components

1. **useTypesenseProductData Hook** (`/src/hooks/useTypesenseProductData.ts`)

   - Fetches product data from Typesense API
   - Includes caching mechanism (5 minutes)
   - Supports gradual rollout via percentage flag

2. **Typesense API Endpoint** (`/src/app/api/product/typesense/[id]/route.ts`)

   - Direct Typesense search integration
   - Optimized field selection (minimal, card, full)
   - Query-level filtering for ACTIVE products only
   - Response transformation matching Elastic format

3. **StoryblokProductCard Component** (`/src/components/product/StoryblokProductCard.tsx`)
   - Updated to support both Elastic and Typesense
   - Automatic source selection based on environment flag
   - Visual source indicator for debugging (when `NEXT_PUBLIC_SHOW_DEV_DEBUG_INFO=true`)

### Data Flow

1. StoryblokProductCard receives product ID from Storyblok CMS
2. Based on `NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API` flag:
   - If `true`: Uses `useTypesenseProductData` hook
   - If `false`: Uses `useElasticProductData` hook (default)
3. Hook fetches data from respective API endpoint
4. Data is transformed to match expected format
5. Product card displays the data with appropriate source label

## Features

### Field Selection

The API supports three field selection modes:

- **minimal**: Basic fields for product lists (id, sku, title, slug, media, prices)
- **card**: Minimal fields plus tags and custom fields
- **full**: All available fields

### Caching

- In-memory cache with 5-minute duration
- HTTP cache headers for CDN optimization
- Longer cache for minimal/card fields (10 minutes)
- Standard cache for full data (5 minutes)

### Search Strategy

The Typesense search uses:

- Query by both `id` and `product_sku` fields
- Filter for `status:=ACTIVE` products only
- Single result limit for optimal performance
- Field selection based on request type

## Testing

### 1. Enable Typesense Integration

Set the environment variable:

```bash
NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API=true
NEXT_PUBLIC_TYPESENSE_DIRECT_ROLLOUT=100  # Optional: Use 100% Typesense
```

### 2. Test Product Cards

Navigate to a page with ShoplabProducts component:

- Products should load from Typesense
- With debug mode enabled (`NEXT_PUBLIC_SHOW_DEV_DEBUG_INFO=true`), you'll see "Typesense" label on product cards

### 3. Verify API Endpoint

Test the Typesense API endpoint directly:

```bash
curl -k "https://localhost:3200/api/product/typesense/18?locale=en&country=Sweden&fields=minimal"
```

### 4. Verify Data Mapping

The Typesense data should map exactly to the same structure as Elastic:

- Product ID and SKU
- Title (multi-language support)
- Slug (multi-language support)
- Pricing (multi-currency with viewData.prices)
- Media (thumbnail and hover images)
- Stock information
- Custom fields for currency-specific prices

### 5. Performance Testing

Monitor the following:

- API response times (should be <200ms)
- Cache hit rates (check browser Network tab)
- Proper field selection (minimal for cards, full for product pages)

### 6. Gradual Rollout

Test the rollout percentage:

```env
NEXT_PUBLIC_TYPESENSE_DIRECT_ROLLOUT=50
```

This will randomly use Typesense for 50% of requests.

## Troubleshooting

### Product Not Found

If products are not found in Typesense:

1. Verify Typesense configuration in environment variables
2. Check that products exist in Typesense collection
3. Ensure products have `status: "ACTIVE"`
4. Verify the product ID format matches between Storyblok and Typesense

### Data Mismatch

If data doesn't match expected format:

1. Check the Typesense document structure
2. Verify the transformation logic in the API endpoint
3. Ensure viewData.prices structure matches expected format
4. Check multi-language title and slug fields

### Performance Issues

If experiencing slow response times:

1. Check Typesense server performance
2. Verify network latency to Typesense host
3. Review field selection (use minimal fields when possible)
4. Check cache configuration

## Migration Strategy

### Phase 1: Development Testing

- Enable in development environment only
- Test with sample products
- Verify data mapping accuracy

### Phase 2: Staging Validation

- Enable in staging with full product catalog
- Performance testing under load
- Validate all product types and variations

### Phase 3: Production Rollout

- Start with 10% rollout (`NEXT_PUBLIC_TYPESENSE_DIRECT_ROLLOUT=10`)
- Monitor error rates and performance
- Gradually increase to 100% over time

### Phase 4: Complete Migration

- Set `NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API=true` permanently
- Remove rollout percentage flag
- Optional: Remove Elastic integration code

## Benefits

1. **Native Typesense Integration**: Direct use of Typesense features and optimizations
2. **Consistent Data Format**: Maintains compatibility with existing components
3. **Performance Optimization**: Field selection and caching for optimal speed
4. **Gradual Migration**: Safe rollout with percentage-based activation
5. **Debug Visibility**: Clear source indicators for troubleshooting

## Future Enhancements

1. **Batch Product Fetching**: Support for fetching multiple products in one request
2. **Advanced Search Features**: Leverage Typesense's faceting and filtering capabilities
3. **Real-time Updates**: WebSocket integration for live product updates
4. **Analytics Integration**: Track search performance and user behavior
5. **Multi-Index Support**: Support for different product indexes per market/language
