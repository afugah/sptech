/**
 * IP Address validation and sanitization utilities
 * Provides secure IP address extraction and validation for the application
 */

import { type NextRequest } from 'next/server';

/**
 * Configuration for trusted proxy detection
 */
const TRUSTED_PROXIES = [
  '127.0.0.1',
  '::1',
  // Vercel Edge Network IPs
  '76.76.19.0/24',
  '76.76.21.0/24',
  // Add your CDN/proxy IPs here
];

/**
 * Extract client IP address from request headers with security validation
 * @param request - Next.js request object
 * @returns Validated client IP address or fallback IP
 */
export function getClientIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr =
    request.headers.get('x-vercel-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    (request as unknown as Record<string, unknown>).ip;

  // Priority order for IP extraction
  const potentialIps = [forwardedFor?.split(',')[0]?.trim(), realIp, remoteAddr as string]
    .filter(Boolean)
    .filter((ip): ip is string => typeof ip === 'string');

  for (const ip of potentialIps) {
    if (ip && isValidIpAddress(ip)) {
      return ip;
    }
  }

  // Fallback to localhost for development
  return process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';
}

/**
 * Validate IP address format (IPv4 and IPv6)
 * @param ip - IP address string to validate
 * @returns True if valid IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  // Remove any surrounding whitespace
  ip = ip.trim();

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) {
    return true;
  }

  // IPv6 validation (basic)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Check if IP address is from a trusted proxy
 * @param ip - IP address to check
 * @returns True if IP is from trusted proxy
 */
export function isTrustedProxy(ip: string): boolean {
  if (!isValidIpAddress(ip)) {
    return false;
  }

  // Check against trusted proxy list
  return TRUSTED_PROXIES.some((trustedIp) => {
    if (trustedIp.includes('/')) {
      // CIDR notation - simplified check for demo
      return ip.startsWith(trustedIp.split('/')[0].slice(0, -1));
    }
    return ip === trustedIp;
  });
}

/**
 * Sanitize IP address for logging and storage
 * @param ip - IP address to sanitize
 * @returns Sanitized IP address
 */
export function sanitizeIpAddress(ip: string): string {
  if (!isValidIpAddress(ip)) {
    return '0.0.0.0';
  }

  // For IPv4, optionally mask the last octet for privacy
  if (process.env.NODE_ENV === 'production' && ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '***';
      return parts.join('.');
    }
  }

  return ip;
}

/**
 * Get geo-location safe IP for rate limiting and security
 * @param request - Next.js request object
 * @returns IP address safe for rate limiting
 */
export function getRateLimitingIp(request: NextRequest): string {
  const clientIp = getClientIpAddress(request);

  // For rate limiting, we want the actual client IP
  // but fall back to a consistent identifier if IP is not available
  if (clientIp === '0.0.0.0') {
    // Use user agent hash as fallback for rate limiting
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `ua-${hashString(userAgent)}`;
  }

  return clientIp;
}

/**
 * Simple hash function for string values
 * @param str - String to hash
 * @returns Hashed string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
