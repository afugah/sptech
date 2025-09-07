import { type NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for fast feature flag resolution
export const runtime = 'edge';

/**
 * Feature flags service using Edge Runtime
 * Provides fast feature flag resolution for A/B testing and gradual rollouts
 */
export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';

  // Base feature flags
  const featureFlags = {
    // Performance optimizations - Phase 1 completed
    'edge-runtime-enabled': true,
    'advanced-caching-enabled': true, // Phase 1 completed
    'multi-tier-caching': true, // Phase 1 completed
    'cache-invalidation-enabled': true, // Phase 1 completed
    'tanstack-optimization': true, // Phase 1 completed
    'isr-enhancement-enabled': false, // Will be enabled in Phase 3

    // Regional features
    'nordic-optimizations': ['SE', 'NO', 'FI', 'DK'].includes(country),
    'eu-gdpr-mode': isEuropeanCountry(country),
    'geolocation-routing': true, // Phase 2 feature

    // A/B test flags (can be used for gradual rollouts)
    'new-checkout-flow': shouldEnableForUser(userId, 'new-checkout-flow', 50), // 50% rollout
    'enhanced-search': shouldEnableForUser(userId, 'enhanced-search', 25), // 25% rollout
    'mobile-app-banner': shouldEnableForUser(userId, 'mobile-app-banner', 10), // 10% rollout
    'edge-runtime-apis': shouldEnableForUser(userId, 'edge-runtime-apis', 75), // 75% rollout

    // Performance experiment flags
    'preload-critical-resources': true,
    'lazy-load-images': true,
    'service-worker-enabled': false, // Will be enabled later
    'storyblok-caching': true, // Phase 1 completed

    // Debug information
    'debug-mode': process.env.NODE_ENV === 'development',
  };

  const response = {
    flags: featureFlags,
    metadata: {
      userId,
      country,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      Vary: 'x-vercel-ip-country',
    },
  });
}

/**
 * Check if country is in European Union (for GDPR compliance)
 */
function isEuropeanCountry(country: string): boolean {
  const euCountries = [
    'AT',
    'BE',
    'BG',
    'HR',
    'CY',
    'CZ',
    'DK',
    'EE',
    'FI',
    'FR',
    'DE',
    'GR',
    'HU',
    'IE',
    'IT',
    'LV',
    'LT',
    'LU',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SK',
    'SI',
    'ES',
    'SE',
  ];

  return euCountries.includes(country);
}

/**
 * Determine if a feature should be enabled for a specific user
 * Uses consistent hashing to ensure same user always gets same result
 */
function shouldEnableForUser(userId: string | null, featureName: string, percentage: number): boolean {
  if (!userId) {
    // For anonymous users, use a random factor
    return Math.random() * 100 < percentage;
  }

  // Create a consistent hash based on userId and feature name
  const input = `${userId}-${featureName}`;
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive number and get percentage
  const normalizedHash = Math.abs(hash) % 100;

  return normalizedHash < percentage;
}
