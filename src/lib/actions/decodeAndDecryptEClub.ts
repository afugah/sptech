'use server';

import crypto from 'crypto';
import { type VoyadoCustomer } from '../types/voyado';

const SECRET_KEY = process.env.VOYADO_ENGAGE_SOFT_KEY;

export const decodeAndDecryptEClub = async (eClub: string): Promise<VoyadoCustomer> => {
  try {
    const key = Buffer.from(SECRET_KEY, 'utf8');
    let stringToDecryptFixed = eClub.replace(/-/g, '+').replace(/_/g, '/');
    switch (stringToDecryptFixed.length % 4) {
      case 2:
        stringToDecryptFixed += '==';
        break;
      case 3:
        stringToDecryptFixed += '=';
        break;
    }
    const bytes = Buffer.from(stringToDecryptFixed, 'base64');
    const iv = Buffer.alloc(16);
    const text = bytes.subarray(16);
    bytes.copy(iv, 0, 0, 16);

    let plaintext = null;
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    plaintext = Buffer.concat([decipher.update(text), decipher.final()]).toString('utf-8');

    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Failed to decode and decrypt eClub parameter', error);
    throw new Error('Failed to decode and decrypt eClub parameter');
  }
};
