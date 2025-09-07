/**
 * Secure webhook authentication utilities
 * Provides timing-safe authentication for webhook endpoints
 */

import { type NextRequest } from 'next/server';

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify webhook secret using timing-safe comparison
 * @param request - Next.js request object
 * @param expectedSecret - Expected webhook secret
 * @returns True if authentication is valid
 */
export function verifyWebhookSecret(request: NextRequest, expectedSecret: string): boolean {
  if (!expectedSecret || expectedSecret === 'dev-webhook-secret') {
    // In development, log warning but allow weak secrets
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Using weak webhook secret in development mode');
      return verifyBearerToken(request, expectedSecret);
    }
    // In production, reject weak secrets
    console.error('❌ Weak or missing webhook secret in production');
    return false;
  }

  return verifyBearerToken(request, expectedSecret);
}

/**
 * Extract and verify bearer token from authorization header
 * @param request - Next.js request object
 * @param expectedSecret - Expected secret value
 * @returns True if bearer token is valid
 */
function verifyBearerToken(request: NextRequest, expectedSecret: string): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  const bearerPrefix = 'Bearer ';
  if (!authHeader.startsWith(bearerPrefix)) {
    return false;
  }

  const providedSecret = authHeader.slice(bearerPrefix.length);
  return timingSafeEqual(providedSecret, expectedSecret);
}

/**
 * Verify webhook signature using HMAC (for enhanced security)
 * Note: Not supported in Edge Runtime - use Node.js runtime for HMAC verification
 * @param request - Next.js request object
 * @param body - Request body string
 * @param secret - HMAC secret key
 * @returns True if signature is valid
 */
export async function verifyWebhookSignature(request: NextRequest, _body: string, _secret: string): Promise<boolean> {
  const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-hub-signature-256');

  if (!signature) {
    return false;
  }

  // HMAC verification not supported in Edge Runtime
  console.warn(
    '⚠️  HMAC signature verification not supported in Edge Runtime. Use bearer token authentication instead.',
  );
  return false;
}

/**
 * Enhanced webhook authentication with multiple verification methods
 * @param request - Next.js request object
 * @param body - Request body string
 * @param config - Authentication configuration
 * @returns Authentication result
 */
export async function authenticateWebhook(
  request: NextRequest,
  body: string,
  config: {
    secret: string;
    allowedIps?: string[];
    requireSignature?: boolean;
  },
): Promise<{ authenticated: boolean; reason?: string }> {
  const { secret, allowedIps, requireSignature = false } = config;

  // Check IP whitelist if provided
  if (allowedIps && allowedIps.length > 0) {
    const clientIp = getClientIp(request);
    if (!allowedIps.includes(clientIp)) {
      return { authenticated: false, reason: 'IP not allowed' };
    }
  }

  // Check signature if required
  if (requireSignature) {
    const signatureValid = await verifyWebhookSignature(request, body, secret);
    if (!signatureValid) {
      return { authenticated: false, reason: 'Invalid signature' };
    }
  } else {
    // Fall back to bearer token verification
    const tokenValid = verifyWebhookSecret(request, secret);
    if (!tokenValid) {
      return { authenticated: false, reason: 'Invalid token' };
    }
  }

  return { authenticated: true };
}

/**
 * Extract client IP address for IP whitelisting
 * @param request - Next.js request object
 * @returns Client IP address
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ((request as unknown as Record<string, unknown>).ip as string) ||
    '127.0.0.1'
  );
}

/**
 * Generate secure webhook secret for configuration
 * @param length - Length of generated secret
 * @returns Generated secret string
 */
export function generateWebhookSecret(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Validate webhook secret strength
 * @param secret - Secret to validate
 * @returns Validation result
 */
export function validateWebhookSecret(secret: string): { valid: boolean; reason?: string } {
  if (!secret) {
    return { valid: false, reason: 'Secret is required' };
  }

  if (secret.length < 16) {
    return { valid: false, reason: 'Secret must be at least 16 characters' };
  }

  if (secret === 'dev-webhook-secret' || secret.includes('secret') || secret.includes('password')) {
    return { valid: false, reason: 'Secret appears to be a default or weak value' };
  }

  // Check for sufficient entropy (basic check)
  const uniqueChars = new Set(secret).size;
  if (uniqueChars < 8) {
    return { valid: false, reason: 'Secret lacks sufficient entropy' };
  }

  return { valid: true };
}
