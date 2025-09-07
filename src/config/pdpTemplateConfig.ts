/**
 * PDP Template Configuration
 *
 * This configuration maps PDP template values to their respective settings.
 * Add new template configurations here to customize product page behavior.
 */

export interface PdpTemplateSettings {
  /**
   * Translation key suffix for size selection
   * Will be used as: `select-${sizeSelectionKey}` and `choose-your-${sizeSelectionKey}`
   */
  sizeSelectionKey: string;

  /**
   * Optional: Custom add to cart button text key
   */
  addToCartKey?: string;

  /**
   * Optional: Whether to show size guide
   */
  showSizeGuide?: boolean;

  /**
   * Optional: Custom label for product variants
   */
  variantLabel?: string;

  /**
   * Optional: Any other custom settings that might be needed in the future
   */
  customSettings?: Record<string, unknown>;
}

/**
 * Template configuration mapping
 * Key: pdp_template value from ElasticSearch
 * Value: Settings for that template
 */
export const PDP_TEMPLATE_CONFIG: Record<string, PdpTemplateSettings> = {
  // Letter selection (for love letter products)
  love_letter: {
    sizeSelectionKey: 'letter',
    variantLabel: 'letter',
    showSizeGuide: false,
  },

  // Ring sizing
  ring_size: {
    sizeSelectionKey: 'ring-size',
    variantLabel: 'ring size',
    showSizeGuide: true,
  },

  // Engraving options
  engraving: {
    sizeSelectionKey: 'engraving-option',
    variantLabel: 'engraving',
    showSizeGuide: false,
    customSettings: {
      showEngravingInput: true,
      maxEngravingLength: 20,
    },
  },

  // Chain/cord length selection
  chain_length: {
    sizeSelectionKey: 'chain-length',
    variantLabel: 'chain length',
    showSizeGuide: false,
  },

  // Bracelet length/size
  bracelet_size: {
    sizeSelectionKey: 'bracelet-size',
    variantLabel: 'bracelet size',
    showSizeGuide: true,
  },

  // Pearl selection
  pearl_type: {
    sizeSelectionKey: 'pearl-type',
    variantLabel: 'pearl type',
    showSizeGuide: false,
  },

  // Stone/gemstone selection
  stone_type: {
    sizeSelectionKey: 'stone-type',
    variantLabel: 'stone',
    showSizeGuide: false,
  },

  // Diamond quality/carat
  diamond_selection: {
    sizeSelectionKey: 'diamond',
    variantLabel: 'diamond',
    showSizeGuide: true,
    customSettings: {
      showCertificate: true,
    },
  },

  // Charm selection
  charm_selection: {
    sizeSelectionKey: 'charm',
    variantLabel: 'charm',
    showSizeGuide: false,
  },

  // Custom measurements
  custom_measurement: {
    sizeSelectionKey: 'custom-measurement',
    variantLabel: 'measurement',
    showSizeGuide: false,
    customSettings: {
      requiresMeasurement: true,
    },
  },

  // Gift card value selection
  gift_card: {
    sizeSelectionKey: 'gift-card-value',
    variantLabel: 'value',
    showSizeGuide: false,
  },

  // Made to order products with lead time
  made_to_order: {
    sizeSelectionKey: 'size',
    variantLabel: 'size',
    showSizeGuide: true,
    customSettings: {
      showLeadTime: true,
    },
  },

  // Add more template configurations as needed
};

/**
 * Default settings for standard products
 */
export const DEFAULT_PDP_SETTINGS: PdpTemplateSettings = {
  sizeSelectionKey: 'size',
  variantLabel: 'size',
  showSizeGuide: true,
};
