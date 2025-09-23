'use client';

import { StoryblokComponent } from '@storyblok/react';
import React from 'react';
import { useWindowWidth } from '@/src/hooks/useWindowWidth';
import { SMALL } from '@/src/styles/theme';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type MemberBenefits } from '@/src/types/framework/storyblok-components';

const MemberBenefitsComponent: IStoryblok.FC<MemberBenefits> = ({ blok }) => {
  const width = useWindowWidth();
  const isMobile = width < SMALL;

  return (
    <div className={'w-full bg-seashell p-10'}>
      <div className={'mb-10 text-center text-sm uppercase'}>{blok.title}</div>
      <p className={'mb-14 text-sm'}>{blok.description}</p>

      <div className={'overflow-x-auto'}>
        <table className={'min-w-full table-auto border-collapse'}>
          <thead>
            <tr className={'text-left text-base uppercase'}>
              <th className={'py-2 font-sans text-sm font-thin uppercase'}>Benefits</th>
              <th className={'py-2 text-center font-sans text-sm font-thin uppercase max-md:px-3'}>
                {isMobile ? 'M' : 'Member'}
              </th>
              <th className={'py-2 text-center font-sans text-sm font-thin uppercase max-md:px-3'}>
                {isMobile ? 'S' : 'Silver'}
              </th>
              <th className={'py-2 text-center font-sans text-sm font-thin uppercase max-md:px-3'}>
                {isMobile ? 'G' : 'Gold'}
              </th>
            </tr>
          </thead>

          <tbody>{blok?.blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberBenefitsComponent;
