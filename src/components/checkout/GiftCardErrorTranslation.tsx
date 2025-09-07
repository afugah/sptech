const giftCardErrorMap = new Map<string, string>([
  ['unable to add/update card', 'Unable to add or update gift card'],
  ['requested gift card has insufficient balance', 'This gift card has insufficient balance'],
  ['grand total is 0', 'Grand total is 0'],
  ['PIN code required', 'PIN code is required'],
  [
    'gift card currency does not match checkout currency',
    "This gift card's currency does not match the checkout's currency",
  ],
  ['outside valid date range', 'This gift card is outside its valid date range'],
  ['gift card status invalid', 'This gift card is invalid'],
  ['Bad Request', 'Unable to add or update gift card'],
]);

const translateGiftCardError = (errorType: string): string => {
  const value = giftCardErrorMap.get(errorType);
  return value ?? errorType;
};

export default translateGiftCardError;
