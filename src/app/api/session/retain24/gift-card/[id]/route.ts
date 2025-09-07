import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';

  const headersList = await headers();
  const authorization = headersList.get('authorization');

  try {
    if (!id) throw new Error('Id is required');

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const result = await fetch(`${baseUrl}-retain24/gift-card-products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });

    if (result.status === 204) return NextResponse.json({ success: true }, { status: 200 });

    return result.json().then(({ error }) => NextResponse.json({ error }, { status: result.status }));
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false });
  }
}
