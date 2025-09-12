/* eslint-disable @typescript-eslint/no-explicit-any */

// This file is a dynamic proxy that re-exports types from Storyblok CLI v4 generated files
// with enhanced custom field types for better development experience
// Generated on: 2025-09-12T19:46:05.569Z

// Re-export all CLI-generated types
export * from '../../../.storyblok/types/325752/storyblok-components.d.ts';

// Enhanced Custom Field Types for CLI v4
export interface StoryblokSlider {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  [k: string]: any;
}

export interface StoryblokVimeo {
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  [k: string]: any;
}

export interface StoryblokColorPicker {
  color: string;
  alpha?: number;
  [k: string]: any;
}

export interface StoryblokPalette {
  value: string;
  name?: string;
  [k: string]: any;
}

export interface StoryblokSeo {
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  canonical_url?: string;
  [k: string]: any;
}

// Asset interface compatible with CLI v4
export interface AssetStoryblok {
  id: number;
  alt?: string;
  name: string;
  focus?: string;
  title?: string;
  filename: string;
  copyright?: string;
  fieldtype?: string;
  is_external_url?: boolean;
  [k: string]: any;
}

// Multilink interface compatible with CLI v4
export type MultilinkStoryblok =
  | {
      cached_url?: string;
      linktype?: 'story';
      [k: string]: any;
    }
  | {
      cached_url?: string;
      linktype?: 'asset' | 'url';
      [k: string]: any;
    }
  | {
      cached_url?: string;
      linktype?: 'email';
      [k: string]: any;
    };
