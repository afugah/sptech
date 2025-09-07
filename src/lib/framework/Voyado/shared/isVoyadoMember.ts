import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export const isVoyadoMember = (contact?: IVoyado.Contact | null | undefined): boolean =>
  contact?.meta?.contactType?.toLowerCase() === 'member';
