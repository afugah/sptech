import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('contactId');

  try {
    if (!id) throw new Error('No id provided');

    return await di.resolve(VoyadoService).getContactOverview(id).then(NextResponse.json);
  } catch (err) {
    console.error('Error getting contact overview by id', err);
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
