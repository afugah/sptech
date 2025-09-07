'use server';

import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export const getOrderHistory = async (id: string): Promise<IVoyado.Transactions> => {
  try {
    if (!id) throw new Error('No contactId provided');

    const voyadoRepository = di.resolve(VoyadoService);
    return voyadoRepository.getTransactions(id);
  } catch (e) {
    console.error(e);

    return {
      count: 0,
      items: [],
      offset: 0,
      totalCount: 0,
    };
  }
};
