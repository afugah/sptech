/**
 * PDP Template Translation Utilities
 *
 * This module provides utilities for handling translations in the PDP template system.
 * It supports both static translations (from JSON files) and dynamic translations
 * (from configuration), with intelligent fallbacks.
 */

import { getTemplateTranslation } from '@/src/config/pdpTemplateTranslations';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';
import { getPdpTemplateSettings } from './pdpTemplate';

/**
 * Options for getting variant selection text
 */
export interface VariantSelectionTextOptions {
  /** The elastic data containing template information */
  elasticData?: IElasticSearch.Item;
  /** The type of selection text needed */
  keyType: 'select' | 'choose-your';
  /** The current language/locale */
  language: string;
  /** Optional: Use dynamic translations instead of static keys */
  useDynamicTranslations?: boolean;
}

/**
 * Get the appropriate variant selection text
 *
 * This function can work in two modes:
 * 1. Static mode (default): Returns translation keys for use with next-intl
 * 2. Dynamic mode: Returns actual translated text from configuration
 *
 * @param options - Configuration options
 * @returns Translation key or translated text
 */
export function getVariantSelectionText(options: VariantSelectionTextOptions): string {
  const { elasticData, keyType, language, useDynamicTranslations = false } = options;
  const settings = getPdpTemplateSettings(elasticData);

  if (useDynamicTranslations) {
    // Return actual translated text from configuration
    const translationType = keyType === 'select' ? 'select' : 'chooseYour';
    return getTemplateTranslation(settings.sizeSelectionKey, translationType, language);
  }

  // Return translation key for use with next-intl (current approach)
  if (keyType === 'select') {
    return `select-${settings.sizeSelectionKey}`;
  }
  return `choose-your-${settings.sizeSelectionKey}`;
}

/**
 * Generate all required translation keys for a template
 * Useful for documentation and validation
 */
export function getRequiredTranslationKeys(templateKey: string): string[] {
  return [`select-${templateKey}`, `choose-your-${templateKey}`];
}

/**
 * Validate that all required translations exist
 * Useful for testing and deployment checks
 */
export function validateTemplateTranslations(
  templateKey: string,
  translations: Record<string, unknown>,
): { valid: boolean; missing: string[] } {
  const requiredKeys = getRequiredTranslationKeys(templateKey);
  const missing: string[] = [];

  for (const key of requiredKeys) {
    const productPage = translations['product-page'] as Record<string, unknown> | undefined;
    if (!productPage?.[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get a fallback text when translation is not available
 * Formats the key into a human-readable string
 */
export function getFallbackText(key: string): string {
  // Convert select-ring-size to "Select ring size"
  // Convert choose-your-ring-size to "Choose your ring size"
  return key
    .replace(/^select-/, 'Select ')
    .replace(/^choose-your-/, 'Choose your ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\b(Your)\b/g, (match) => match.toLowerCase());
}
