# Vercel Password Protection & API Calls

## Issue

When Vercel's Password Protection is enabled on deployment environments (dev, staging), internal API calls from the frontend to backend can fail or return inconsistent data. This is because Vercel's password protection runs before your application's middleware and affects all routes, including API routes.

## Symptoms

- Different data displayed between local development and password-protected deployments
- API calls returning 401 or 403 errors
- Inconsistent stock values or product data
- Elastic search data not loading properly

## Root Cause

Vercel Password Protection uses JWT tokens that are **URL-specific** and cannot be shared across different paths. When a user authenticates on the main site, the JWT cookie is only valid for that specific URL path. API routes at different paths (e.g., `/api/*`) cannot access this cookie, causing authentication failures.

Simply using `credentials: 'same-origin'` does NOT work because the JWT tokens are scoped to specific URLs.

## Solution: Protection Bypass for Automation

Vercel provides a **Protection Bypass for Automation** feature specifically designed for this use case. This allows internal API calls to bypass password protection using a special header.

### Step 1: Get the Bypass Secret

1. Go to your Vercel Project Settings
2. Navigate to **General** → **Protection Bypass for Automation**
3. Copy the bypass secret
4. Add it to your `.env.local` file:

```env
# Must be NEXT_PUBLIC_ to be available on client-side
NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET=your-secret-here
```

### Step 2: Include Bypass Headers in Fetch Requests

Add the `x-vercel-protection-bypass` header to all API fetch requests:

```javascript
// Basic fetch with bypass header
fetch('/api/endpoint', {
  headers: {
    'x-vercel-protection-bypass': process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET,
    'x-vercel-set-bypass-cookie': 'samesitenone', // For client-side calls
  },
});

// Fetch with no-cache and bypass headers
fetch('/api/endpoint', {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'x-vercel-protection-bypass': process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET,
    'x-vercel-set-bypass-cookie': 'samesitenone',
  },
});
```

### Step 3: Use Utility Functions

Use the provided utility functions from `src/util/fetchWithCredentials.ts`:

```javascript
import { fetchWithCredentials, fetchFreshWithCredentials } from '@/src/util/fetchWithCredentials';

// Standard fetch with bypass headers
const response = await fetchWithCredentials('/api/endpoint');

// Fetch fresh data (no-cache) with bypass headers
const freshResponse = await fetchFreshWithCredentials('/api/endpoint');
```

These utility functions automatically include the bypass headers when the environment variable is set.

## Files Updated

- `.env.example` - Added `NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET` environment variable
- `src/components/product/ProductPageClient.tsx` - Added bypass headers to all API calls
- `src/util/fetchWithCredentials.ts` - Updated utility functions to include bypass headers

## Alternative Solutions (Not Implemented)

### 1. Server-Side Rendering Only

Move all data fetching to server-side (getServerSideProps or RSC) where the password protection doesn't affect internal API calls.

### 2. Environment-Specific Bypass

Configure Vercel to exclude `/api/*` routes from password protection (requires Vercel configuration changes).

### 3. Custom Authentication Headers

Implement a custom authentication header system that bypasses Vercel's password protection for API routes.

## Testing

1. Enable password protection in Vercel dashboard
2. Add the bypass secret to your `.env.local` file
3. Deploy or restart your local development server
4. Visit product pages and verify all data loads correctly
5. Check browser DevTools Network tab to ensure API calls include the bypass headers:
   - Look for `x-vercel-protection-bypass` header in request headers
   - Verify API calls return 200 status codes

## Important Security Note

⚠️ **The bypass secret is exposed on the client-side** when using `NEXT_PUBLIC_` prefix. This is necessary for client-side API calls to work. Consider the following:

1. The bypass secret only works for your specific Vercel project
2. It only bypasses password protection, not actual authentication/authorization
3. For sensitive operations, consider moving data fetching to server-side

## Best Practices

1. **Always use the bypass headers** for internal API calls when password protection is enabled
2. **Use utility functions** for consistent configuration across the application
3. **Test in password-protected environments** before deploying to production
4. **Keep the bypass secret secure** - regenerate if compromised
5. **Consider server-side fetching** for sensitive data to avoid exposing the bypass secret

## Related Issues

- Stock display discrepancy between local and dev environments
- Elastic search data not loading on password-protected sites
- Storyblok content not fetching properly
