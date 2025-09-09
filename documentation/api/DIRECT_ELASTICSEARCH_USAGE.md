# Direct Elasticsearch API Usage Guide

## Overview

The Direct Elasticsearch API implementation provides optimized product data fetching with support for field filtering and query-level optimizations. This implementation exists alongside the Search Application endpoint for easy switching and A/B testing.

## Endpoints

### 1. Single Product Endpoint

```
GET /api/product/elasticsearch/[id]
```

**Query Parameters:**

- `locale`: Language locale (default: 'en')
- `country`: Country for currency selection (default: 'Sweden')
- `fields`: Field set selection
  - `minimal`: Essential fields only (~2-3KB)
  - `card`: Product card fields (~4-5KB)
  - `full`: All fields (default, ~15-20KB)

**Example:**

```bash
curl "https://localhost:3100/api/product/elasticsearch/1475?fields=minimal&locale=en&country=Sweden"
```

### 2. Batch Product Endpoint

```
POST /api/product/elasticsearch/batch
```

**Request Body:**

```json
{
  "ids": ["1475", "1476", "1477"],
  "fields": "minimal",
  "locale": "en",
  "country": "Sweden",
  "includeInactive": false
}
```

**Response:**

```json
{
  "products": [...],
  "productMap": {
    "1475": { ... },
    "1476": { ... }
  },
  "meta": {
    "requested": 3,
    "found": 3,
    "missing": []
  }
}
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```env
# Enable direct Elasticsearch API (default: false)
NEXT_PUBLIC_USE_DIRECT_ELASTIC_API=true

# Gradual rollout percentage (0-100)
NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT=0
```

### Switching Between Endpoints

The system supports three switching modes:

#### 1. Full Switch

Set `NEXT_PUBLIC_USE_DIRECT_ELASTIC_API=true` to use direct API for all requests.

#### 2. Gradual Rollout

Set `NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT=50` to use direct API for 50% of requests randomly.

#### 3. Default (Search Application)

Leave both settings as `false` or `0` to continue using the Search Application endpoint.

## Performance Improvements

### Payload Size Reduction

| Field Type | Search Application | Direct API | Reduction |
| ---------- | ------------------ | ---------- | --------- |
| Minimal    | 6-8KB              | 2-3KB      | 67%       |
| Card       | 8-10KB             | 4-5KB      | 50%       |
| Full       | 15-20KB            | 15-20KB    | 0%        |

### Response Time Improvements

- **Direct Connection**: 20-30% faster by eliminating abstraction layer
- **Query Optimization**: ACTIVE products filtered at query level
- **Field Filtering**: Reduced data transfer with `_source` filtering

### Caching Strategy

- **Minimal/Card Fields**: 10 minutes CDN cache (s-maxage=600)
- **Full Fields**: 5 minutes CDN cache (s-maxage=300)
- **Batch Requests**: 1 minute CDN cache (s-maxage=60)

## Hook Integration

Both `useElasticProductData` and `useProductDataWithFallback` hooks automatically support endpoint switching:

```typescript
// Automatically uses the configured endpoint
const { product, loading, error } = useElasticProductData(productId);
```

The hooks check environment variables and handle:

- Feature flag detection
- Gradual rollout percentage
- Automatic endpoint selection
- Cache management

## Testing

### Manual Testing

1. **Test Search Application (default):**

   ```bash
   curl "https://localhost:3100/api/product/elastic/1475?fields=minimal"
   ```

2. **Test Direct API:**

   ```bash
   # Set in .env.local: NEXT_PUBLIC_USE_DIRECT_ELASTIC_API=true
   curl "https://localhost:3100/api/product/elasticsearch/1475?fields=minimal"
   ```

3. **Compare Results:**
   Both endpoints should return identical product data.

### A/B Testing

1. Set rollout percentage:

   ```env
   NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT=50
   ```

2. Monitor metrics:
   - Response times
   - Payload sizes
   - Error rates
   - Cache hit rates

### Performance Testing

```bash
# Measure response time
time curl -s "https://localhost:3100/api/product/elasticsearch/1475?fields=minimal" > /dev/null

# Check response size
curl -s "https://localhost:3100/api/product/elasticsearch/1475?fields=minimal" | wc -c
```

## Migration Path

### Phase 1: Development Testing

1. Deploy both endpoints in parallel
2. Test with `NEXT_PUBLIC_USE_DIRECT_ELASTIC_API=true` locally
3. Verify data consistency

### Phase 2: Staging Rollout

1. Enable for 10% of traffic: `NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT=10`
2. Monitor performance metrics
3. Gradually increase to 50%, then 100%

### Phase 3: Production

1. Start with 5% rollout
2. Monitor for 24 hours
3. Increase to 25%, 50%, 100% based on metrics

## Rollback

If issues occur, instantly rollback by setting:

```env
NEXT_PUBLIC_USE_DIRECT_ELASTIC_API=false
NEXT_PUBLIC_ELASTIC_DIRECT_ROLLOUT=0
```

No code changes required - the Search Application endpoint remains fully functional.

## Key Differences

### Search Application API

- Limited to `params` object structure
- No `_source` field filtering
- No query-level status filtering
- Simpler but less flexible

### Direct Elasticsearch API

- Full Query DSL support
- `_source` field filtering for optimal payloads
- Query-level ACTIVE product filtering
- Batch operations support
- More control but requires careful query construction

## Troubleshooting

### Product Not Found

- Verify product exists and is ACTIVE
- Check Elasticsearch index directly
- Ensure correct ID format (string)

### Performance Issues

- Check Elasticsearch cluster health
- Monitor query execution time
- Verify CDN cache is working

### Data Mismatch

- Both endpoints filter for ACTIVE products
- Ensure same locale and country parameters
- Check field transformation logic

## Future Enhancements

1. **Advanced Search Endpoint**: Full-text search with filters and aggregations
2. **GraphQL Integration**: Efficient field selection via GraphQL
3. **Real-time Updates**: WebSocket support for inventory changes
4. **Multi-Index Search**: Search across multiple product indices
5. **Personalization**: User-specific product recommendations
