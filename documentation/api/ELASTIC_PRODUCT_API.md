# Elasticsearch Product API Documentation

## Overview

The Elasticsearch Product API (`/api/product/elastic/[id]`) provides product data from the Elasticsearch search index. This endpoint is optimized for performance and supports field selection to minimize data transfer.

## Endpoint

```
GET /api/product/elastic/[id]
```

## Parameters

### Path Parameters

- `id` (required): Product ID to fetch. Can be either:
  - Numeric product ID (e.g., `1475`)
  - SKU string (though the Search Application may not support SKU searches)

### Query Parameters

- `locale` (optional): Locale for localized content. Default: `se-sv`
  - Format: `{market}-{language}` (e.g., `se-sv`, `no-no`)
- `fields` (optional): Field set to return. Default: `full`
  - `minimal`: Returns only essential fields for product cards (reduced payload)
  - `full`: Returns complete product data including all variants and pricing

## Response Formats

### Minimal Fields Response

Used by StoryblokProductCard for efficient rendering. Contains only essential product information.

```json
{
  "id": "1475",
  "sku": "10-102-01303",
  "title": "101 Hoops",
  "slug": "/products/101-hoops",
  "price": 2400,
  "compareAt": 3000,
  "thumbnail": {
    "url": "https://media.example.com/product.jpg",
    "hoverUrl": "https://media.example.com/product-hover.jpg"
  },
  "tags": [],
  "created_at": "2024-01-01T00:00:00Z",
  "stock": 10,
  "custom_fields": {
    "price_sek": ["2400"]
  }
}
```

### Full Fields Response

Complete product data including all variants, pricing structures, and metadata. Used by ProductPageClient and other consumers requiring full product details.

```json
{
  "id": "1475",
  "key": "1475",
  "sku": "10-102-01303",
  "title": "101 Hoops",
  "display_name": "101 Hoops",
  "created_at": "2024-01-01T00:00:00Z",
  "thumbnail": {
    "url": "https://media.example.com/product.jpg",
    "hoverUrl": "https://media.example.com/product-hover.jpg"
  },
  "status": "ACTIVE",
  "slug": "/products/101-hoops",
  "stock": 10,
  "price": 2400,
  "compareAt": 3000,
  "salePrice": ["2400"],
  "tags": [],
  "otherColors": [],
  "sizes": [],
  "onlinedate": null,
  "coming_soon_publish_date": null,
  "new_until_date": null,
  "pricing": undefined,
  "custom_fields": {
    "price_sek": ["2400"],
    "sale_price_sek": ["2400"],
    "discount_sek": ["20"],
    "price_eur": ["240"],
    "sale_price_eur": ["240"],
    "discount_eur": ["0"]
  },
  "viewData": {
    "prices": {
      "price_sek": 2400,
      "sale_price_sek": 2400,
      "discount_sek": "20"
    }
  }
}
```

## Usage Examples

### Fetching Minimal Product Data (StoryblokProductCard)

```javascript
// In useElasticProductData hook
const apiUrl = `/api/product/elastic/${id}?locale=${locale}&fields=minimal`;
const response = await fetch(apiUrl);
```

### Fetching Full Product Data (ProductPageClient)

```javascript
// Default behavior - full fields
const elasticUrl = `/api/product/elastic/${productId}`;
const response = await fetch(elasticUrl);
```

## Performance Optimizations

### Implemented Optimizations

1. **Field Selection**: The `fields` parameter allows consumers to request only the data they need:

   - `minimal`: ~60% smaller payload for product cards
   - `full`: Complete data for product pages

2. **Response Caching**: All responses include cache headers:

   - CDN cache: 5 minutes (`s-maxage=300`)
   - Stale-while-revalidate: 1 minute
   - Client-side in-memory cache: 5 minutes (in hooks)

3. **Optimized Transformation**: Minimal fields skip unnecessary processing:
   - Simplified price extraction
   - Reduced field mappings
   - Smaller response payload

### Limitations

Due to the Elasticsearch Search Application API constraints:

1. **No \_source Filtering**: The Search Application doesn't support `_source` field filtering, so we fetch complete documents and filter in the application layer.

2. **No Query-Level Status Filtering**: Cannot filter for `ACTIVE` products at the query level; filtering happens in JavaScript.

3. **Limited Search Parameters**: The Search Application only supports `id` and `fullSlug` parameters, not arbitrary field searches.

## Error Handling

### Error Responses

```json
{
  "error": "Product not found in Elastic search: 1475",
  "debug": {
    "searchedSku": "1475",
    "source": "elastic"
  }
}
```

Status codes:

- `200`: Success
- `400`: Bad request (missing ID)
- `404`: Product not found
- `500`: Internal server error

## Consumers

### Current Consumers

1. **StoryblokProductCard** (`src/components/product/StoryblokProductCard.tsx`)

   - Uses: `useElasticProductData` hook with `fields=minimal`
   - Purpose: Display product cards in Storyblok components

2. **ProductPageClient** (`src/components/product/ProductPageClient.tsx`)

   - Uses: Direct fetch with `fields=full` (default)
   - Purpose: MTO product support, stock availability

3. **useProductDataWithFallback** (`src/hooks/useProductDataWithFallback.ts`)
   - Uses: Direct fetch with `fields=full` (default)
   - Purpose: Product data with fallback (currently only uses Elastic)

## Future Improvements

1. **Direct Elasticsearch API**: Consider using the direct Elasticsearch API instead of the Search Application for more advanced query capabilities.

2. **True \_source Filtering**: If switching to direct API, implement proper `_source` filtering at the query level.

3. **Query-Level Status Filtering**: Add proper filtering for ACTIVE products in the Elasticsearch query.

4. **Field Projection**: Implement more granular field selection based on consumer needs.

5. **Batch API**: Support fetching multiple products in a single request for efficiency.
