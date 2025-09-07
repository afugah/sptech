export interface Translations {
  [key: string]: string;
}

export interface CustomAttributes {
  [key: string]: string;
}

export interface Tags {
  [key: string]: string[];
}

export enum UserModalViewEnum {
  LOGIN,
  SIGN_UP,
  NEWSLETTER_SIGN_UP,
  FORGOT_PASSWORD,
  NEW_PARTNER,
  SENT_EMAIL,
}
