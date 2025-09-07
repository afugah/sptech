import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, bonusCheckId } = body;

    if (!contactId || !bonusCheckId) {
      throw new Error('contactId and bonusCheckId are required');
    }

    const response = await di.resolve(VoyadoService).redeemVoucher(contactId, bonusCheckId);
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : 'Unknown error',
        success: false,
      },
      { status: 400 },
    );
  }
}
