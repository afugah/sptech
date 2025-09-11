/**
 * Feature flags for payment providers
 *
 * This file controls which payment providers are enabled in the application.
 * To enable a payment provider:
 * 1. Set its flag to true
 * 2. Install the required dependencies in package.json
 * 3. Ensure all required code is uncommented/restored
 */

export const PAYMENT_FEATURES = {
  // Currently active payment providers
  WALLEY: true,

  // Disabled payment providers
  KLARNA: false,
  ADYEN: false,
  QLIRO: false,
  SVEA: false,
};

/**
 * Helper function to check if a payment provider is enabled
 */
export function isPaymentProviderEnabled(provider: keyof typeof PAYMENT_FEATURES): boolean {
  return PAYMENT_FEATURES[provider] === true;
}

/**
 * Feature flags for pricing structure
 */
export const PRICING_FEATURES = {
  // Use store group and market-specific pricing (complex custom fields like "discount|member-gold_se")
  // When false, uses simple multi-currency pricing (price_sek, price_nok, price_eur, price_usd)
  USE_STOREGROUP_MARKET_PRICING: false,
};

/**
 * Helper function to check if simple pricing is enabled
 */
export function useSimplePricing(): boolean {
  return PRICING_FEATURES.USE_STOREGROUP_MARKET_PRICING === false;
}

/**
 * Feature flags for UI components
 */
export const UI_FEATURES = {
  // When true, uses inline text menu with logo on left, menu in center, cart on right
  // When false, uses traditional hamburger menu with slide-in navigation
  USE_INLINE_HEADER_MENU: true,
};

/**
 * Helper function to check if inline header menu is enabled
 */
export function useInlineHeaderMenu(): boolean {
  return UI_FEATURES.USE_INLINE_HEADER_MENU === true;
}
