'use client';

import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type MemberBenefitsRow } from '@/src/types/framework/storyblok-components';

const MemberBenefitsRowComponent: IStoryblok.FC<MemberBenefitsRow> = ({ blok }) => {
  const { gold, member, silver, title } = blok;

  return (
    <tr className={'transition-colors hover:bg-creme'}>
      <td className={'py-2 text-base'}>{title}</td>
      <td className={'text-center text-2xl text-green max-md:px-3'}>{member ? '●' : ''}</td>
      <td className={'text-center text-2xl text-gray max-md:px-3'}>{silver ? '●' : ''}</td>
      <td className={'text-center text-2xl text-red max-md:px-3'}>{gold ? '●' : ''}</td>
    </tr>
  );
};

export default MemberBenefitsRowComponent;
