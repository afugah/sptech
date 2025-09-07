'use server';

import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export async function setNewPersonalData(id: string, data: IVoyado.Contact['attributes']) {
  const voyadoService = di.resolve(VoyadoService);
  const reqData = await voyadoService.updateContact(id, data);

  return reqData;
}
