# Storyblok Webhook Cache Invalidation

## Overview

This system provides automatic cache invalidation when content is published or unpublished in Storyblok. It ensures that your Next.js ISR cache is always synchronized with your CMS content.

## Architecture

```
Storyblok CMS → Webhook Event → /api/storyblok-webhook → Cache Invalidation → Fresh Content
```

### Key Features

- **Secure Webhook Validation**: HMAC SHA-1 signature verification
- **Multi-Language Support**: Handles all market-language combinations
- **Smart Cache Invalidation**: Different strategies for different content types
- **Backward Compatibility**: Supports both new i18n and legacy webhook formats

## Setup Instructions

### 1. Environment Configuration

Add these variables to your `.env.local` file:

```env
# Generate a secure random string (min 32 characters)
STORYBLOK_WEBHOOK_SECRET=your_secure_random_string_here

# Optional: Skip signature verification for testing only
# STORYBLOK_SKIP_SIGNATURE_VERIFICATION=true
```

To generate a secure webhook secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Storyblok Configuration

1. Navigate to your Storyblok Space Settings
2. Go to **Settings → Webhooks**
3. Create a new webhook with these settings:
   - **Name**: Production Cache Invalidation (or appropriate name)
   - **URL**: `https://your-domain.com/api/storyblok-webhook`
   - **Secret**: Use the same value as `STORYBLOK_WEBHOOK_SECRET`
   - **Triggers**:
     - ✅ Story published
     - ✅ Story unpublished
     - ✅ Story deleted (optional)
     - ✅ Story moved (optional)

### 3. Deploy to Production

For Vercel deployment:
1. Add the environment variables in the Vercel dashboard
2. Deploy your changes
3. The webhook endpoint will be available at `/api/storyblok-webhook`

## Testing

### Local Testing

Use the provided test scripts to verify your webhook endpoint:

#### Using Node.js test script:
```bash
# Test all scenarios
node scripts/test-webhook.js

# Test specific scenario (1-6)
node scripts/test-webhook.js 1
```

#### Using shell script:
```bash
# Test local environment
./scripts/test-storyblok-webhook.sh local

# Test production environment
./scripts/test-storyblok-webhook.sh production
```

### Manual Testing with cURL

Test individual webhook scenarios:

```bash
# Set your webhook secret
WEBHOOK_SECRET="your_webhook_secret_here"

# Create test payload
PAYLOAD='{"action":"published","story_id":123,"full_slug":"test-page"}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

# Send webhook
curl -X POST https://localhost:3000/api/storyblok-webhook \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Test Scenarios

1. **Home Page Update**: Tests cache invalidation for all locale home pages
2. **Regular Page Update**: Tests standard page cache invalidation
3. **Config Update**: Tests full site cache invalidation
4. **Content Page with i18n**: Tests internationalized slug handling
5. **Invalid Signature**: Verifies security (should return 401)
6. **Unpublish Action**: Tests content unpublishing

## How It Works

### Cache Invalidation Strategies

#### Home Page
When the home page is published:
- Invalidates all locale roots (`/se`, `/fi`, `/en`, `/no`, etc.)
- Invalidates root path (`/`)
- Ensures fresh home page content across all markets

#### Config/Global Config
When configuration is updated:
- Invalidates entire site layout
- Clears all page caches
- Updates navigation, header, footer tags
- Ensures configuration changes propagate site-wide

#### Regular Content Pages
For standard content pages:
- Invalidates specific page paths for all locales
- Handles both simple slugs and nested paths
- Supports content-specific paths like `content/size-guide/rings`

### Multi-Language Handling

The webhook handles two formats:

#### New i18n Format
```json
{
  "action": "published",
  "full_slug": "products/ring",
  "full_slug__i18n__sv": "produkter/ring",
  "full_slug__i18n__en": "products/ring",
  "full_slug__i18n__fi": "tuotteet/sormus"
}
```

#### Legacy Format
```json
{
  "action": "published",
  "slug": "products/ring"
}
```

### Locale Mapping

The system maps Storyblok languages to market locales:
- `sv` → Swedish market (`se`)
- `fi` → Finnish market (`fi`)
- `en` → English market (`en`)
- `nb` → Norwegian market (`no`)

Combined locales are also supported:
- `se-en` → Swedish market, English language
- `fi-sv` → Finnish market, Swedish language
- etc.

## Monitoring

### Success Indicators
- Webhook returns HTTP 200 with success message
- `revalidatedPaths` array contains invalidated paths
- Fresh content appears after cache invalidation
- Processing time is reasonable (<1000ms)

### Error Monitoring
Check logs for:
- Signature verification failures (security concern)
- JSON parsing errors (malformed webhooks)
- Cache invalidation failures
- Unusually high processing times

### Logging
The webhook logs detailed information:
- Signature verification status
- Processed paths
- Processing time
- Error details with context

## Security Considerations

1. **Always use HTTPS** for webhook endpoints
2. **Never expose webhook secrets** in client-side code
3. **Always verify signatures** in production
4. **Monitor for suspicious activity** (failed signatures, high volume)
5. **Use environment-specific secrets** for staging/production

## Troubleshooting

### Common Issues

#### Signature Verification Failing
- Verify webhook secret matches exactly in both Storyblok and environment
- Ensure you're using SHA-1 algorithm (Storyblok standard)
- Check that raw body is used for signature calculation

#### Cache Not Clearing
- Verify Next.js ISR is properly configured
- Check that paths match your routing structure
- Ensure `revalidatePath` is called with correct paths
- Verify cache tags are properly set in your data fetching

#### Multi-Language Issues
- Check locale configuration matches your routing
- Verify market-language mapping is correct
- Ensure i18n slugs are properly configured in Storyblok

#### Performance Issues
- Monitor webhook processing time
- Consider implementing debouncing for frequent updates
- Use specific cache tags instead of broad path invalidation

## API Reference

### Webhook Endpoint

**URL**: `/api/storyblok-webhook`  
**Method**: `POST`  
**Headers**:
- `Content-Type: application/json`
- `webhook-signature: [HMAC SHA-1 signature]`

### Request Payload

```typescript
interface WebhookPayload {
  action?: 'published' | 'unpublished' | 'deleted' | 'moved';
  story_id?: number;
  full_slug?: string;
  slug?: string;
  space_id?: number;
  // i18n slugs (optional)
  [key: `full_slug__i18n__${string}`]: string;
}
```

### Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Cache invalidated successfully",
  "action": "published",
  "slug": "page-slug",
  "revalidatedPaths": ["/se/page-slug", "/fi/page-slug"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "processing_time_ms": 145
}
```

**Unauthorized (401)**:
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Error (400/500)**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Maintenance

### Regular Tasks
- Monitor webhook delivery in Storyblok dashboard
- Check error logs for failed invalidations
- Review processing times for performance issues
- Update webhook secret periodically

### Performance Optimization
- Use specific cache tags for granular invalidation
- Implement debouncing for rapid updates
- Consider queue-based processing for high volume
- Monitor and optimize slow cache invalidations