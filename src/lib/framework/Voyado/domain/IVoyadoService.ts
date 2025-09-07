import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export interface IVoyadoService {
  getContactIdByEmail(email: string): Promise<string>;

  getContact(id: string): Promise<IVoyado.Contact>;

  getContactByEmail(email: string): Promise<IVoyado.Contact>;

  subscribeToProduct(body: IVoyado.Subscription): Promise<IVoyado.Subscription>;

  updateContact(id: string, body: Partial<IVoyado.Contact['attributes']>): Promise<IVoyado.Contact>;

  updateContactType(id: string, type: 'Member' | 'Contact'): Promise<void>;

  promoteToMember(id: string): Promise<void>;

  getOrCreateContact(body: IVoyado.CreateContact, locale: string): Promise<IVoyado.Contact>;

  getPromotions(id: string): Promise<IVoyado.Promotions>;

  getTransactions(id: string): Promise<IVoyado.Transactions>;

  getVouchers(id: string): Promise<IVoyado.Vouchers>;

  setContactPreference(
    id: string,
    property: 'acceptsEmail' | 'acceptsPostal' | 'acceptsSms',
    state: boolean,
  ): Promise<IVoyado.Contact>;

  subscribeToNewsletter(email: string, locale: string): Promise<boolean>;
}
