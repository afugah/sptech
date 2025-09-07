'use client';

import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type FaqRow } from '@/src/types/framework/storyblok-components';
import { CollapseRounded } from '../../ui/CollapseRounded';

const FaqRowComponent: IStoryblok.FC<FaqRow> = ({ blok }) => {
  if (!blok.title) return null;

  return (
    <CollapseRounded titleClassName={'text-black'} title={blok.title}>
      <li className={'text-base'}>{blok.description}</li>
    </CollapseRounded>
  );
};

export default FaqRowComponent;
