import { NextResponse } from 'next/server';
import { di } from '@/src/lib/di';
import { CommerceService } from '@/src/lib/framework/Commerce/services/CommerceService';

export async function GET() {
  try {
    const commerceService = di.resolve(CommerceService);
    const storeGroupId = await commerceService.getStoreGroupId();

    return NextResponse.json({ storeGroupId });
  } catch (error) {
    console.error('Error fetching store group ID:', error);
    // Return default store group ID on error
    const commerceService = di.resolve(CommerceService);
    const defaultStoreGroupId = commerceService.getDefaultStoreGroupId();

    return NextResponse.json({ storeGroupId: defaultStoreGroupId });
  }
}
