import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { GiftCartUseRequest } from '@/src/app/api/checkout/retain24/gift-card/model';

export async function PUT(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BRINK_API_URL;
  const xShopperApiKey = process.env.BRINK_SHOPPER_X_API_KEY ?? '';

  const headersList = await headers();
  const authorization = headersList.get('authorization');

  try {
    const data = plainToInstance(GiftCartUseRequest, await req.json());
    const validation = validateSync(data, { validationError: { target: false } });
    if (validation.length) {
      console.error('Validation failed', validation);
      throw new Error(`Validation failed`);
    }
    const id = data.id.replace(/\s+/g, '');

    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const result = await fetch(`${baseUrl}-retain24/gift-cards/${id}`, {
      method: 'PUT',
      body: data.ToJson(),
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization ?? '',
        'x-shopper-api-key': xShopperApiKey,
        'x-forwarded-for': clientIp,
      },
    });

    if (result.status === 204) {
      return NextResponse.json(
        {
          message: 'Gift card applied successfully',
          success: true,
          shouldReloadCart: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: 'Unexpected response from server',
        success: false,
      },
      { status: result.status },
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : err,
        headers,
        success: false,
      },
      { status: 400 },
    );
  }
}
