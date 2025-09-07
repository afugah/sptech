'use server';

import { di } from '@/src/lib/di';
import { ShoplabService } from '@/src/lib/framework/Shoplab/services/ShoplabService';

export async function getNavigationMenu(locale: string) {
  try {
    const shoblabService = di.resolve(ShoplabService);
    return shoblabService.getNavigation(locale);
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return []; // Return empty array as fallback
  }
}
export async function getPayloadNavigationMenu(locale: string) {
  try {
    const shoblabService = di.resolve(ShoplabService);
    return shoblabService._getNewPayloadNavigation(locale);
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return []; // Return empty array as fallback
  }
}
