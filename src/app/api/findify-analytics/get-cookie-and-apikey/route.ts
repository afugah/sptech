import { type NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for fast cookie/API key resolution
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const {
    marketCode,
  }: {
    marketCode: string;
  } = await req.json();

  const cookieValue = req.cookies.get('findifyLastRequestId');

  // Get Findify API key from environment variables
  const findifyApiKey = getFindifyApiKey(marketCode);

  if (cookieValue || findifyApiKey) {
    return NextResponse.json(
      {
        cookieValue,
        apiKey: findifyApiKey,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache', // Don't cache sensitive API keys
        },
      },
    );
  } else {
    return NextResponse.json({ error: 'Cookie or APIKEY not found' }, { status: 400 });
  }
}

/**
 * Get Findify API key for the specified market
 * Uses environment variables instead of dependency injection for edge runtime
 */
function getFindifyApiKey(marketCode: string): string | undefined {
  // Map market codes to existing search environment variable names
  const marketToEnvMap: Record<string, string> = {
    SE: process.env.SEARCH_FINDIFY_SE_API_KEY || '',
    NO: process.env.SEARCH_FINDIFY_NO_API_KEY || '',
    FI: process.env.SEARCH_FINDIFY_FI_API_KEY || '',
    EN: process.env.SEARCH_FINDIFY_EN_API_KEY || '',
    // Add other markets as needed using the SEARCH_FINDIFY_*_API_KEY pattern
  };

  return marketToEnvMap[marketCode] || process.env.SEARCH_FINDIFY_SE_API_KEY; // Default to SE
}
