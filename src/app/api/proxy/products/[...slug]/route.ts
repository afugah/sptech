import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for products API calls
 * This handles Vercel password protection bypass on the server-side
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const { searchParams } = request.nextUrl;
    const locale = searchParams.get('locale');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    // Get the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin;

    // Build the internal API URL
    const slugPath = slug.join('/');
    const internalApiUrl = `${baseUrl}/api/products/${slugPath}?locale=${locale}`;

    // Get bypass secret from server environment
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

    console.warn('[Products Proxy] Making internal request:', {
      url: internalApiUrl,
      hasSecret: !!bypassSecret,
    });

    // Make the internal API call with bypass headers
    const response = await fetch(internalApiUrl, {
      headers: {
        ...(bypassSecret && {
          'x-vercel-protection-bypass': bypassSecret,
        }),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Products Proxy] Internal API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from internal API', status: response.status },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Products Proxy] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
