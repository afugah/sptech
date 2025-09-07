import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const headersList = await headers();
  const authorization = headersList.get('authorization');

  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const result = await fetch(`${baseUrl}-voyado/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });
    if (result.status === 204) {
      // No content to return
      return new NextResponse(null, { status: 204 });
    } else if (result.ok) {
      const session = await result.json();
      return NextResponse.json(session);
    } else {
      // Handle other error statuses if necessary
      return NextResponse.json({ message: 'Deletion failed', success: false });
    }
  } catch (err) {
    return NextResponse.json({ message: err, success: false });
  }
}
