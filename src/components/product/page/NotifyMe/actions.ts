'use server';

import { di } from '@/src/lib/di';
import { ShoplabService } from '@/src/lib/framework/Shoplab/services/ShoplabService';
import { type IShoplabApi } from '@/src/lib/framework/Shoplab/types/IShoplabApi';

export const notifyBackInStock = async (
  body: Omit<IShoplabApi.IBackInStockRequest, 'lang_code'>,
  locale: string,
): Promise<boolean> => {
  try {
    const shoblabService = di.resolve(ShoplabService);
    const config = di.resolve(di.Tokens.Configuration);
    const lang_code = config.getLanguage(locale);
    const requestData = { ...body, lang_code };
    await shoblabService.notifyBackInStock(requestData);
    return true;
  } catch (e) {
    console.error(e);

    return false;
  }
};
