/**
 * @see https://docs.eu-west-1.demo.brinkcommerce.io/domains/Shopper/services/ShopperRetain24/
 */
export namespace IRetain24 {
  /* #region Gift card product */
  export interface GiftCartProductAddBody {
    /**
     * Amount in minor units to load on gift card product
     */
    amountToLoad: number;

    /**
     * For email distribution. See Retain24 API documentation for details
     * @see https://api-docs.giftcards.awardit.com/api/mvalue/index.html#/Cards/post_cards
     */
    receivingEmail?: string;
    /**
     * Personalized text message for email distribution. See Retain24 API documentation for details
     * @see https://api-docs.giftcards.awardit.com/api/mvalue/index.html#/Cards/post_cards
     */
    emailText?: string;
    /**
     * Retain24 Template ID
     */
    templateId: number;

    /**
     * Optional date and time of when to distribute the gift card product
     */
    sendDate?: string;

    /**
     * For SMS distribution. See Retain24 API documentation for details
     * @see https://api-docs.giftcards.awardit.com/api/mvalue/index.html#/Cards/post_cards
     */
    receivingMsisdn?: string;
    /**
     * For EXTERNAL distribution. See Retain24 API documentation for details
     * @see https://api-docs.giftcards.awardit.com/api/mvalue/index.html#/Cards/post_cards
     */
    referenceNumber?: string;
    /**
     * Optional merchant reference
     */
    merchantReference?: string;
    /**
     * Personalized text message for SMS distribution. See Retain24 API documentation for details
     * @see https://api-docs.giftcards.awardit.com/api/mvalue/index.html#/Cards/post_cards
     */
    smsText?: string;
  }

  export type GiftCartProductRequest = Required<
    Pick<GiftCartProductAddBody, 'amountToLoad' | 'sendDate' | 'receivingEmail' | 'emailText'>
  >;
  /* #endregion */

  /* #region Gift card usage */
  export interface GiftCartUseBody {
    amount?: number;
    pin?: string;
  }

  export interface GiftCartUseRequest extends Required<Pick<GiftCartUseBody, 'pin'>> {
    id: string;
  }
  /* #endregion */
}
