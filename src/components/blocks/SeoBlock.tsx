'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import React from 'react';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type SeoBlock } from '@/src/types/framework/storyblok-components';
import { isSlider, safeString } from '@/src/types/framework/storyblok-helpers';

const SeoBlockComponent: IStoryblok.FC<SeoBlock> = ({ blok, ...props }) => {
  const { title, blocks, seoLinks, backgroundColor } = blok;

  return (
    <section
      className={'p-10 text-black md:p-20'}
      style={{ backgroundColor: isSlider(backgroundColor) ? safeString(backgroundColor.value, '#e7e5e4') : '#e7e5e4' }}
      {...storyblokEditable(blok)}
      {...props}
    >
      <div className={'mx-auto max-w-6xl'}>
        {title && <h1 className={'mb-2 text-lg font-light uppercase tracking-widest md:text-xl'}>{title}</h1>}
        <div className={'columns-1 gap-8 text-xs leading-relaxed md:columns-3 md:gap-12'}>
          {blocks?.map((block) => <StoryblokComponent blok={block} key={block._uid} />)}
        </div>

        {seoLinks && seoLinks.length > 0 && (
          <div className={'mt-8 border-t border-backgroundAlternative pt-6'}>
            <div className={'grid grid-cols-1 gap-x-8 gap-y-1 text-xs md:grid-cols-3 md:gap-x-12'}>
              {seoLinks.map((link) => (
                <div key={link._uid}>
                  <StoryblokComponent blok={link} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SeoBlockComponent;
