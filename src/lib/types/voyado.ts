interface RedemptionChannels {
  instruction: string | null;
  type: string;
  value: string;
  valueType: string;
}

export interface VoyadoPromotion {
  description: string | null;
  expiresOn: string | null;
  externalId: string | null;
  heading: string | null;
  id: string;
  imageUrl: string | null;
  link: string | null;
  name: string;
  promotionId: string;
  redeemed: boolean;
  redeemedOn: string | null;
  redemptionChannels: RedemptionChannels;
  type: string;
}

interface Money {
  currency: string;
  amount: number;
}

export interface VoyadoVouchers {
  count: number;
  offset: number;
  items: VoyadoVoucherItem[];
  totalCount: number;
}

export interface VoyadoVoucherItem {
  expiresOn: string;
  redeemedOn: string | null;
  redeemed: boolean;
  id: string;
  checkNumber: string;
  name: string;
  value: Money;
  localValues: Money[];
  bonusPoints: number;
}

export interface VoyadoCustomer {
  contactId: string;
  email: string;
  firstName: string | undefined | null;
  lastName: string | undefined | null;
  displayName: string;

  memberNumber: string;

  bonusBasedLevel: string | undefined | null;
  bonusBasedLevelChanged: string;
  bonusBasedLevelExpires: string | null;
  bonusBasedLevelLeftForUpgrade: number;
  memberLevelsBonusPoints: number;
  bonusPoints: number;
  mobilePhone: string;
  street: string | undefined | null;
  city: string | undefined | null;
  zipCode: string | undefined | null;
  countryCode: string | undefined | null;
  promotions: VoyadoPromotion[];
  vouchers: VoyadoVouchers;
}

export interface VoyadoTransactions {
  count: number;
  items: VoyadoTransactionItem[];
  offset: number;
  totalCount: number;
}

export interface VoyadoTransactionItem {
  createdDate: string;
  externalId: string;
  groupCurrency: string;
  id: string;
  lineItems: VoyadoTransactionLineItem[];
  localCurrency: string;
  localNetPriceSum: number;
  netPriceSum: number;
  numberOfItems: number;
  storeName: string;
  storeType: string;
  transactionNumber: string;
}

interface VoyadoTransactionLineItem {
  articleGroup: string;
  articleName: string;
  articleNumber: string;
  discountCode: string | null;
  id: string;
  isReturned: boolean;
  localPrice: number;
  price: number;
  quantity: number;
  sku: string;
  type: string;
}
