/**
 * Type helpers for Storyblok components with unknown properties
 */

import { type StoryblokAsset } from '@/.storyblok/types/storyblok';
import { type InfoBar, type IntroBanner, type MenuLink } from './storyblok-components';

// Generic type for Storyblok content with unknown properties
export type StoryblokContent = Record<string, unknown>;

// Type for Storyblok story content
export interface StoryblokStoryContent extends StoryblokContent {
  _uid?: string;
  component?: string;
  [key: string]: unknown;
}

// Helper type for color picker properties
export interface StoryblokColorPicker {
  color?: string;
  value?: string;
}

// Helper type for slider properties
export interface StoryblokSlider {
  value?: number | string;
}

// Helper type for asset/image properties
export interface StoryblokImage extends Partial<StoryblokAsset> {
  filename?: string;
  alt?: string;
  name?: string;
  title?: string;
}

// Type guard for checking if value is a valid React node string
export function isValidStringNode(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

// Type guard for checking if value is a valid image
export function isValidImage(value: unknown): value is StoryblokImage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'filename' in value &&
    typeof (value as Record<string, unknown>).filename === 'string'
  );
}

// Type guard for color picker
export function isColorPicker(value: unknown): value is StoryblokColorPicker {
  return typeof value === 'object' && value !== null && ('color' in value || 'value' in value);
}

// Type guard for slider
export function isSlider(value: unknown): value is StoryblokSlider {
  return typeof value === 'object' && value !== null && 'value' in value;
}

// Safe property access helper
export function safeAccess<T>(value: unknown, defaultValue: T): T {
  return (value as T) ?? defaultValue;
}

// Safe string access
export function safeString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue;
}

// Safe number access
export function safeNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' ? value : defaultValue;
}

// Safe boolean access
export function safeBoolean(value: unknown, defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

// Type guards for specific Storyblok components
export function isInfoBar(value: unknown): value is InfoBar {
  return (
    typeof value === 'object' &&
    value !== null &&
    'component' in value &&
    (value as Record<string, unknown>).component === 'infoBar'
  );
}

export function isIntroBanner(value: unknown): value is IntroBanner {
  return (
    typeof value === 'object' &&
    value !== null &&
    'component' in value &&
    (value as Record<string, unknown>).component === 'introBanner'
  );
}

export function isMenuLink(value: unknown): value is MenuLink {
  return (
    typeof value === 'object' &&
    value !== null &&
    'component' in value &&
    (value as Record<string, unknown>).component === 'menuLink'
  );
}
