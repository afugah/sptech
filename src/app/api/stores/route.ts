import { type NextRequest, NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { StoreService } from '@/src/lib/framework/Store/services/StoreService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const storeType = searchParams.get('storeType');

  try {
    const storeService = di.resolve(StoreService);

    const filters = {
      ...(country && country !== 'all' && { country }),
      ...(city && { city }),
      ...(storeType && storeType !== 'all' && { storeType }),
    };

    const stores = await storeService.getStores(filters);
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}
