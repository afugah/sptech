# Storyblok Webhook Testing Guide

## Prerequisites

1. **Start the development server**:
   ```bash
   yarn dev
   ```
   Make sure the server is running on https://localhost:3100

2. **Configure environment variables** in `.env.local`:
   ```env
   STORYBLOK_WEBHOOK_SECRET=e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66
   
   # Optional: For initial testing, you can skip signature verification
   # STORYBLOK_SKIP_SIGNATURE_VERIFICATION=true
   ```

## Testing Methods

### Method 1: Simple Shell Script (Recommended for Quick Testing)
```bash
./scripts/test-webhook-simple.sh
```

This runs a basic test with a simple payload to verify the endpoint is working.

### Method 2: Comprehensive Shell Script
```bash
./scripts/test-storyblok-webhook.sh local
```

This runs 6 different test scenarios including:
- Home page publishing
- Regular page publishing
- Config changes
- i18n content
- Invalid signatures
- Unpublishing

### Method 3: Node.js Test Script
```bash
# Test all scenarios
node scripts/test-webhook.js

# Test specific scenario (1-6)
node scripts/test-webhook.js 1
```

### Method 4: Manual cURL Testing
```bash
# Set your webhook secret
WEBHOOK_SECRET="e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66"

# Create test payload
PAYLOAD='{"action":"published","story_id":123,"slug":"test-page"}'

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

# Send webhook
curl -X POST https://localhost:3100/api/storyblok-webhook \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD" \
  --insecure
```

## Expected Responses

### Successful Response (200)
```json
{
  "success": true,
  "message": "Cache invalidated successfully",
  "action": "published",
  "slug": "test-page",
  "revalidatedPaths": [
    "/se/test-page",
    "/fi/test-page",
    "/en/test-page",
    "/no/test-page"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "processing_time_ms": 145
}
```

### Invalid Signature (401)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "Error description"
}
```

## Troubleshooting

### Connection Refused
If you get "Connection refused" errors:
1. Make sure `yarn dev` is running
2. Check that the server is accessible at https://localhost:3100
3. The dev server uses experimental HTTPS, so use `--insecure` flag with curl

### Signature Verification Failing
If webhooks return 401 Unauthorized:
1. Verify the `STORYBLOK_WEBHOOK_SECRET` matches in both `.env.local` and test script
2. For initial testing, you can temporarily set `STORYBLOK_SKIP_SIGNATURE_VERIFICATION=true`
3. Make sure you're using SHA-1 algorithm (Storyblok standard)

### No Response or Timeout
If the webhook doesn't respond:
1. Check the console output of `yarn dev` for any errors
2. Verify the API route exists at `/src/app/api/storyblok-webhook/route.ts`
3. Check for any TypeScript or build errors

### JQ Parse Errors
If you see "jq: parse error" when using shell scripts:
1. The response might not be valid JSON
2. Check the dev server console for error messages
3. Use the simple test script first to see raw output

## Production Setup

### 1. Configure Storyblok Webhook

In your Storyblok space:
1. Go to Settings → Webhooks
2. Create new webhook:
   - **Name**: Production Cache Invalidation
   - **URL**: `https://your-domain.com/api/storyblok-webhook`
   - **Secret**: Use the same value as `STORYBLOK_WEBHOOK_SECRET`
   - **Triggers**: Story published, Story unpublished

### 2. Deploy to Vercel

1. Add environment variable in Vercel:
   ```
   STORYBLOK_WEBHOOK_SECRET=e4ccfe7f807b6616b393ad0008a4a93acf22f8b3da1aa4bc7a842d77f5f2cb66
   ```

2. Deploy:
   ```bash
   vercel
   ```

### 3. Test Production Webhook

```bash
# Test against production
./scripts/test-storyblok-webhook.sh production

# Or manually
curl -X POST https://your-domain.com/api/storyblok-webhook \
  -H "Content-Type: application/json" \
  -H "webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## Monitoring

### Check Webhook Logs

In development:
- Check the console output of `yarn dev`
- Look for `[Storyblok Webhook INFO/WARN/ERROR]` messages

In production (Vercel):
- Check Function logs in Vercel dashboard
- Monitor for signature verification failures
- Track processing times

### Verify Cache Invalidation

After a successful webhook:
1. Check that `revalidatedPaths` contains expected paths
2. Visit the invalidated pages to confirm fresh content
3. Monitor Next.js cache behavior

## Security Notes

1. **Never commit the webhook secret** to version control
2. **Always use HTTPS** for webhook endpoints
3. **Never set `STORYBLOK_SKIP_SIGNATURE_VERIFICATION=true`** in production
4. **Use different secrets** for staging and production environments
5. **Monitor for failed signature verifications** as they may indicate attacks