'use server';

import { di } from '@/src/lib/di';
import { VoyadoService } from '@/src/lib/framework/Voyado/services/VoyadoService';

export const onNewsletterFormSubmit = async (email: string, locale: string): Promise<boolean> => {
  return di.resolve(VoyadoService).subscribeToNewsletter(email, locale);
};
