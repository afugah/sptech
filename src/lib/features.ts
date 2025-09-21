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

/**
 * Feature flags for membership/loyalty systems
 */
export const MEMBERSHIP_FEATURES = {
  // Voyado integration for customer loyalty and promotions
  VOYADO: false,

  // Shopab Members system (works similarly to Voyado)
  SHOPAB_MEMBERS: false,
};

/**
 * Helper function to check if Voyado is enabled
 */
export function isVoyadoEnabled(): boolean {
  return MEMBERSHIP_FEATURES.VOYADO === true;
}

/**
 * Helper function to check if Shopab Members is enabled
 */
export function isShopabMembersEnabled(): boolean {
  return MEMBERSHIP_FEATURES.SHOPAB_MEMBERS === true;
}

/**
 * Helper function to check if any membership system is enabled
 */
export function isMembershipSystemEnabled(): boolean {
  return isVoyadoEnabled() || isShopabMembersEnabled();
}

/**
 * Feature flags for product page features
 */
export const PRODUCT_PAGE_FEATURES = {
  // Store availability functionality
  STORE_AVAILABILITY: false,

  // Stock rules display (technical debug information like rule names)
  STOCK_RULES: false,

  // Diamond facts modal and section
  DIAMOND_FACTS: false,

  // Drop a hint functionality
  DROP_A_HINT: false,

  // Wishlist functionality
  WISHLIST: false,
};

/**
 * Helper function to check if store availability is enabled
 */
export function isStoreAvailabilityEnabled(): boolean {
  return PRODUCT_PAGE_FEATURES.STORE_AVAILABILITY === true;
}

/**
 * Helper function to check if stock rules are enabled
 */
export function isStockRulesEnabled(): boolean {
  return PRODUCT_PAGE_FEATURES.STOCK_RULES === true;
}

/**
 * Helper function to check if diamond facts are enabled
 */
export function isDiamondFactsEnabled(): boolean {
  return PRODUCT_PAGE_FEATURES.DIAMOND_FACTS === true;
}

/**
 * Helper function to check if drop a hint is enabled
 */
export function isDropAHintEnabled(): boolean {
  return PRODUCT_PAGE_FEATURES.DROP_A_HINT === true;
}

/**
 * Helper function to check if wishlist is enabled
 */
export function isWishlistEnabled(): boolean {
  return PRODUCT_PAGE_FEATURES.WISHLIST === true;
}
