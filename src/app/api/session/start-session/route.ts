import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const isLogout = searchParams.get('isLogout');
  const reqIsLogout = isLogout ? Boolean(+isLogout) : false;
  try {
    const body = await req.json();

    const commerceService = di.resolve(CommerceService);

    return await commerceService.startSession(body, reqIsLogout).then(NextResponse.json);
  } catch (err) {
    return NextResponse.json({ message: err, headers, success: false }, { status: 500 });
  }
}
