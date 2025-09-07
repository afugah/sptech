'use client';

import { storyblokEditable } from '@storyblok/react';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SeoLink } from '@/src/types/framework/storyblok-components';

const SeoLinkComponent: IStoryblok.FC<SeoLink> = ({ blok, ...props }) => {
  const { label, url, newTab } = blok;

  if (!url || !label) return null;

  const LinkComponent = newTab ? 'a' : Link;
  const linkProps = newTab ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : { href: url };

  return (
    <LinkComponent
      {...linkProps}
      className={'block text-xs font-bold tracking-wide text-gray-800 transition-colors hover:text-black'}
      {...storyblokEditable(blok)}
      {...props}
    >
      {label}
    </LinkComponent>
  );
};

export default SeoLinkComponent;
