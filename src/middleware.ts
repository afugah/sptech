import { JsBloom } from '@getkoala/js-bloom';
import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import GeneratedBloomFilter from '@/src/redirects/redirects-bloom-filter.json';
import { type RedirectEntry } from '@/src/redirects/types';
import { routing } from './i18n/routing';

const bloomFilter = new JsBloom(GeneratedBloomFilter);
const intlMiddleware = createIntlMiddleware(routing, {
  localeDetection: true,
  alternateLinks: false,
});

const BLOCKED_PATHS = [
  '/globalassets/',
  '/cdn-cgi/',
  '/wp-includes/',
  '/wp-admin/',
  '/wp-admin',
  '/wp-content/',
  '/wordpress',
];

function isBlockedPath(pathname: string): boolean {
  return BLOCKED_PATHS.some((path) => pathname.includes(path));
}

// function isAuthenticated(request: NextRequest) {
//   const authHeader = request.headers.get('authorization');
//   if (!authHeader) return false;

//   const auth = authHeader.split(' ')[1];
//   const [username, password] = Buffer.from(auth, 'base64').toString().split(':');

//   const envUsername = process.env.NEXT_PUBLIC_AUTH_USERNAME;
//   const envPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

//   return username === envUsername && password === envPassword;
// }

async function handleRedirect(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const testPath = `^${pathname}$`;

  if (!bloomFilter.test(testPath)) return;

  const api = new URL(`/api/redirects?pathname=${encodeURIComponent(pathname)}`, request.nextUrl.origin);

  try {
    const redirectData = await fetch(api);
    if (!redirectData.ok) return;

    const redirectEntry: RedirectEntry | undefined = await redirectData.json();

    if (redirectEntry?.target) {
      const targetUrl = new URL(redirectEntry.target, request.nextUrl.origin);
      return NextResponse.redirect(targetUrl.toString(), 308);
    }
  } catch {
    // Silent fail
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Allow Storyblok preview without password
  if (url.searchParams.has('_storyblok_tk')) {
    return NextResponse.next();
  }

  // Block certain paths
  if (isBlockedPath(url.pathname)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // // Basic Auth for staging/dev if not internal or Storyblok
  // const env = process.env.NEXT_PUBLIC_ENVIRONMENT || '';
  // const isInternalPath = url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/');

  // if (['staging', 'development'].includes(env) && !isInternalPath && !isAuthenticated(request)) {
  //   return new NextResponse('Authentication required', {
  //     status: 401,
  //     headers: {
  //       'WWW-Authenticate': 'Basic realm="Protected Site"',
  //     },
  //   });
  // }

  // Redirect check via BloomFilter
  const redirectResponse = await handleRedirect(request);
  if (redirectResponse) return redirectResponse;

  // Run Next-Intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*|site.webmanifest|images/.*|favicon.*|static/.*|assets/.*|sitemap.xml|sitemaps/.*).*)',
    '/globalassets/:path*',
    '/cdn-cgi/:path*',
    '/wp-includes/:path*',
    '/wp-admin/:path*',
    '/wp-content/:path*',
    '/wordpress/:path*',
  ],
  unstable_allowDynamic: [
    '**/node_modules/next-intl/**',
    '**/node_modules/@formatjs/**',
    '**/node_modules/intl-messageformat/**',
    '**/src/i18n/routing.ts',
  ],
};
