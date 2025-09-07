'use server';

import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/src/lib/configuration/auth';
import { di } from '@/src/lib/di';
import { ValidationError } from '@/src/lib/errors/ValidationError';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';
import { isVoyadoMember } from '@/src/lib/framework/Voyado/shared/isVoyadoMember';
import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export async function getOrCreateContactForRegister(
  data: IVoyado.CreateContact,
  locale: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const voyadoService = di.resolve(VoyadoService);

    const contact = await voyadoService.getOrCreateContact(
      {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        mobilePhone: data.phone,
        socialSecurityNumber: data.personalIdentityNumber ?? undefined,
        isRegistrationCompleted: true,
      },
      locale,
    );

    const isFirebaseUser = await fetchSignInMethodsForEmail(auth, contact.attributes.email);
    const config = di.resolve(di.Tokens.Configuration);
    const language = config.getLanguage(locale);

    // 1️⃣ Promote if needed and update immediately after
    if (!isVoyadoMember(contact) || (!isVoyadoMember(contact) && isFirebaseUser)) {
      try {
        await voyadoService.promoteToMember(contact.id);

        await voyadoService.updateContact(contact.id, {
          ...contact.attributes,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          mobilePhone: data.phone,
          socialSecurityNumber: data.personalIdentityNumber ?? undefined,
          language: contact.attributes.language || language,
        });
      } catch (error) {
        console.error('[getOrCreateContactForRegister] Promote or Update Failed:', error);
      }
    }

    // 2️⃣ If already a member but not in Firebase, update contact as well
    if (isVoyadoMember(contact) && !isFirebaseUser.length) {
      try {
        await voyadoService.updateContact(contact.id, {
          ...contact.attributes,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          mobilePhone: data.phone,
          socialSecurityNumber: data.personalIdentityNumber ?? undefined,
          language: contact.attributes.language || language,
        });
      } catch (error) {
        if (error instanceof ValidationError) {
          return { success: false, message: error.message };
        } else {
          console.error('[getOrCreateContactForRegister] Update Failed:', error);
          return { success: false };
        }
      }
    }

    return { success: !!contact };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, message: error.message };
    } else {
      console.error('[getOrCreateContactForRegister]', error);
      return { success: false };
    }
  }
}
