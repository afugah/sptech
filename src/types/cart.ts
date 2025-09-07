export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartTotals {
  subTotal: string | number;
  discountTotal: number;
  grandTotal: string | number;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
  currencyCode?: string;
}

export interface GiftCard {
  id: string;
  // Add other gift card properties as needed
}
