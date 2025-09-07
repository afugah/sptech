import { type NextRequest, NextResponse } from 'next/server';
import redirects from '@/src/redirects/redirects.json';
import { type RedirectEntries } from '@/src/redirects/types';

// Use Edge Runtime for global distribution and faster response times
export const runtime = 'edge';

export function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname');
  if (!pathname) {
    return new Response('Bad Request', { status: 400 });
  }

  const redirect = (redirects as RedirectEntries)[pathname];

  if (!redirect) {
    return new Response('No redirect', { status: 404 });
  }

  return NextResponse.json(redirect, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache for 1 hour, CDN for 24 hours
      Vary: 'Accept-Encoding',
    },
  });
}
