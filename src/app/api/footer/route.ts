import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { FooterService } from '@/src/lib/framework/Footer/services/FooterService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const footerService = di.resolve(FooterService);
    const footerData = await footerService.getFooterData(locale);

    return NextResponse.json(footerData);
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return NextResponse.json({ error: 'Failed to fetch footer data' }, { status: 500 });
  }
}
