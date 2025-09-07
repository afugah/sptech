/**
 * Detect if we're in a Vercel build environment
 */
export function isVercelBuild(): boolean {
  // Multiple checks to ensure we catch Vercel build environment
  return (
    // Vercel build environment
    (process.env.VERCEL === '1' && !process.env.VERCEL_URL) ||
    // Next.js build phase
    process.env.NEXT_PHASE === 'phase-production-build' ||
    // CI environment without runtime
    (process.env.CI === 'true' && process.env.NODE_ENV === 'production') ||
    // Vercel specific build
    (process.env.VERCEL_ENV === 'production' && process.env.BUILDING_FOR_VERCEL === '1')
  );
}
