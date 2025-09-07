/**
 * Utility function for fetch requests with Vercel Protection Bypass
 * This ensures API calls work when Vercel Password Protection is enabled
 */

interface FetchOptions extends RequestInit {
  // Extend RequestInit to ensure we have all standard fetch options
}

/**
 * Get headers for Vercel Protection Bypass
 * Only includes bypass headers if the secret is available
 */
function getProtectionBypassHeaders(): Record<string, string> {
  const bypassSecret = process.env.NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET;

  if (bypassSecret) {
    return {
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'samesitenone', // For client-side calls
    };
  }

  return {};
}

/**
 * Wrapper around fetch that automatically includes Vercel Protection Bypass headers
 * This allows API calls to work when password protection is enabled
 */
export function fetchWithCredentials(url: string, options?: FetchOptions): Promise<Response> {
  const protectionHeaders = getProtectionBypassHeaders();

  return fetch(url, {
    ...options,
    credentials: 'same-origin', // Include cookies as fallback
    headers: {
      ...protectionHeaders,
      ...options?.headers,
    },
  });
}

/**
 * Fetch with no-cache headers and Vercel Protection Bypass
 * Useful for API calls that should always get fresh data
 */
export function fetchFreshWithCredentials(url: string, options?: FetchOptions): Promise<Response> {
  const protectionHeaders = getProtectionBypassHeaders();

  return fetch(url, {
    ...options,
    cache: 'no-store',
    credentials: 'same-origin', // Include cookies as fallback
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      ...protectionHeaders,
      ...options?.headers,
    },
  });
}
