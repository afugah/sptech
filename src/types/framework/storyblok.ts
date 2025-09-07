import { type SbBlokData } from '@storyblok/react';
import type React from 'react';

export namespace IStoryblok {
  export interface Links {
    links: Link[];
  }

  export interface Link {
    id: number;
    uuid: string;
    slug: string;
    path: null;
    parent_id: number;
    name: string;
    is_folder: boolean;
    published: boolean;
    is_startpage: boolean;
    position: number;
    real_path: string;

    alternates: Array<{
      path: string;
      name: string;
      lang: string;
      published: boolean;
      translated_slug: string;
    }>;
  }

  // Accept any component-specific type T, while ensuring the "blok" prop
  // conforms to Storyblok's required shape via intersection with SbBlokData.
  // This avoids forcing generated component types to extend SbBlokData directly
  // (which some generators do not), while preserving correct runtime typing.
  export type FC<T> = React.FC<{ blok: T & SbBlokData }>;
}
