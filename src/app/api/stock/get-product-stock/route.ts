import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';

/**
 * Checks if the request is coming from our own application
 * @param req The incoming request
 * @returns boolean indicating if the request is internal
 */
async function isInternalRequest(req: NextRequest): Promise<boolean> {
  const headersList = await headers();

  // Check for our custom internal API header
  const hasInternalHeader = req.headers.get('x-internal-api') === process.env.INTERNAL_API_SECRET;

  // Check referer to ensure it's from our domain
  const referer = headersList.get('referer');
  const isFromOurDomain = referer
    ? referer.includes(process.env.NEXT_PUBLIC_BASE_DOMAIN ?? '') ||
      referer.startsWith('http://localhost:') ||
      referer.startsWith('https://localhost:')
    : false;

  // In development, we might want to be more permissive
  if (process.env.NODE_ENV === 'development') {
    return Boolean(hasInternalHeader || isFromOurDomain || true);
  }

  return Boolean(hasInternalHeader || isFromOurDomain);
}

export async function GET(req: NextRequest) {
  // Block external requests
  if (!(await isInternalRequest(req))) {
    return NextResponse.json(
      {
        message: 'Unauthorized: This API is for internal use only',
        success: false,
      },
      { status: 403 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const countryCode = searchParams.get('countryCode');

  try {
    if (!productId || !countryCode) {
      throw new Error('Missing required parameters: productId and countryCode are required');
    }

    const stockResult = await di.resolve(CommerceService).getStock(productId, countryCode);
    return NextResponse.json(stockResult);
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : String(err),
        success: false,
      },
      { status: 400 },
    );
  }
}
