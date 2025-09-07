import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const contactId = searchParams.get('contactId');

  try {
    if (!contactId) throw new Error('No contactId provided');

    return await di.resolve(VoyadoService).getVouchers(contactId).then(NextResponse.json);
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
