/**
 * Utility functions for handling PDP template customizations
 */

import { DEFAULT_PDP_SETTINGS, PDP_TEMPLATE_CONFIG, type PdpTemplateSettings } from '@/src/config/pdpTemplateConfig';
import { type IElasticSearch } from '@/src/lib/framework/Product/types/IElasticSearch';

/**
 * Get the PDP template value from elastic data
 */
export function getPdpTemplateValue(elasticData?: IElasticSearch.Item): string | null {
  const template = elasticData?.attributes?.pdp_template?.value;
  return template || null;
}

/**
 * Get PDP template settings based on elastic data
 * Falls back to default settings if template not found or not configured
 */
export function getPdpTemplateSettings(elasticData?: IElasticSearch.Item): PdpTemplateSettings {
  const templateValue = getPdpTemplateValue(elasticData);

  if (!templateValue) {
    return DEFAULT_PDP_SETTINGS;
  }

  // Return configured settings or default if not found
  return PDP_TEMPLATE_CONFIG[templateValue] || DEFAULT_PDP_SETTINGS;
}

/**
 * Get the appropriate translation key for size/variant selection
 * @param elasticData - Elastic search data containing template info
 * @param keyType - Type of key needed ('select' or 'choose-your')
 */
export function getVariantSelectionKey(
  elasticData?: IElasticSearch.Item,
  keyType: 'select' | 'choose-your' = 'select',
): string {
  const settings = getPdpTemplateSettings(elasticData);

  if (keyType === 'select') {
    return `select-${settings.sizeSelectionKey}`;
  }

  return `choose-your-${settings.sizeSelectionKey}`;
}

/**
 * Check if a specific template is active
 * Useful for backward compatibility or specific template checks
 */
export function isTemplate(templateName: string, elasticData?: IElasticSearch.Item): boolean {
  return getPdpTemplateValue(elasticData) === templateName;
}

/**
 * Get custom setting value from template configuration
 */
export function getCustomTemplateSetting<T = unknown>(
  settingKey: string,
  elasticData?: IElasticSearch.Item,
): T | undefined {
  const settings = getPdpTemplateSettings(elasticData);
  return settings.customSettings?.[settingKey] as T | undefined;
}
