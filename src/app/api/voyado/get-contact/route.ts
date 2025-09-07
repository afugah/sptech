import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get('email');

  try {
    if (!email) throw new Error('No email provided');

    return await di.resolve(VoyadoService).getContactByEmail(email).then(NextResponse.json);
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
