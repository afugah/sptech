import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';
  const searchParams = req.nextUrl.searchParams;
  const discountCode = searchParams.get('discountCode');
  const headersList = await headers();
  const authorization = headersList.get('authorization');

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    const result = await fetch(`${baseUrl}/sessions/discount-codes/${discountCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    const session = await result.json();
    return NextResponse.json(session);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
