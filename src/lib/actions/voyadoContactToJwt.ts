'use server';

import jwt from 'jsonwebtoken';
import { type IVoyado } from '../framework/Voyado/types/IVoyado';

const SECRET_KEY = process.env.AUTH_SECRET;

export interface IVoyadoTokenPayload {
  contactId: string;
  email: string;
  memberLevel: string;
  contactType: IVoyado.Contact['meta']['contactType'];
}

export const voyadoContactToJwt = async (
  contact: Pick<IVoyado.Contact, 'id'> & {
    attributes: Pick<IVoyado.Contact['attributes'], 'email' | 'bonusBasedLevel'>;
    meta: Pick<IVoyado.Contact['meta'], 'contactType'>;
  },
) => {
  const {
    id,
    attributes: { email, bonusBasedLevel },
  } = contact;

  const payload: IVoyadoTokenPayload = {
    contactId: id,
    email,
    memberLevel: bonusBasedLevel,
    contactType: contact.meta.contactType,
  };

  const token = jwt.sign(payload, SECRET_KEY);

  return token;
};

export const verifyVoyadoContactToken = async (token: string): Promise<IVoyadoTokenPayload | null> => {
  const decoded = jwt.verify(token, SECRET_KEY) as IVoyadoTokenPayload;

  return decoded;
};
