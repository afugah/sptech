import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const countryCode = searchParams.get('countryCode');

  try {
    if (!productId || !countryCode) throw new Error('No productId provided');

    return await di.resolve(CommerceService).getAvailableStock(productId, countryCode).then(NextResponse.json);
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
