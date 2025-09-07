import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';

  const headersList = await headers();
  const authorization = headersList.get('authorization');

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const body = await req.json();
    const result = await fetch(`${baseUrl}-voyado/start`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });

    const responseText = await result.text();

    let response;
    try {
      response = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return NextResponse.json({ message: 'Invalid JSON response', raw: responseText, success: false });
    }

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
