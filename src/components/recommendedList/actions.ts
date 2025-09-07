'use server';

import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';

export async function fetchRecommendedItems(marketCode: string, slot: string, itemId?: string, take = 5) {
  const collectionService = di.resolve(CollectionService);
  const { items } = await collectionService.getRecommendedItems(marketCode, slot, itemId, { take });

  return items;
}
