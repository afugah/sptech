'use server';

import { di } from '@/src/lib/di';
import { ShoplabService } from '@/src/lib/framework/Shoplab/services/ShoplabService';

export async function getNavigationMenu(locale: string) {
  const shoblabService = di.resolve(ShoplabService);
  return shoblabService.getNavigation(locale);
}
