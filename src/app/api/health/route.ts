import { NextResponse } from 'next/server';

// Use Edge Runtime for fast health checks
export const runtime = 'edge';

/**
 * Health check endpoint optimized for Edge Runtime
 * Provides fast response times globally for monitoring and load balancing
 */
export function GET() {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    runtime: 'edge',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(healthData, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
