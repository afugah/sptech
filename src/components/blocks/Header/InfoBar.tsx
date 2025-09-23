'use client';

import { storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import React from 'react';
import { useIdentification } from '@/src/context/identificationContext';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type InfoBar } from '@/src/types/framework/storyblok-components';
import { type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
import { displayForMember } from '@/src/util/displayForMemeber';
import { renderRichContent } from '@/src/utils/storyblok/renderRichContent';

const InfoBarComponent: IStoryblok.FC<InfoBar> = ({ blok }) => {
  const { getTokenPayload } = useIdentification();
  const customerMemberLevel = getTokenPayload()?.memberLevel;
  const shouldDisplayBlock = blok?.memberLevel ? displayForMember(blok.memberLevel, customerMemberLevel ?? '') : true;

  if (!shouldDisplayBlock) return;

  const infoBarClasses = classNames(
    'flex py-3 items-center justify-around w-full',
    (blok?.colorPickerBackground as StoryblokColorPicker)?.color ? '' : 'bg-black',
  );
  const infoBarTextClasses = classNames(
    'px-5 text-sm text-center uppercase',
    (blok?.colorPickerText as StoryblokColorPicker)?.color ? '' : 'text-white',
  );

  const RenderContent = blok?.content.content?.[0]?.content
    ? renderRichContent(blok?.content, {
        paragraphClass: 'm-0',
        linkClass: '',
        emailLinkClass: '',
        externalLinkClass: '',
        internalLinkClass: '',
      })
    : null;

  return (
    <div
      className={infoBarClasses}
      {...storyblokEditable(blok)}
      data-test={'infoBar'}
      style={
        (blok?.colorPickerBackground as StoryblokColorPicker)?.color
          ? { backgroundColor: (blok.colorPickerBackground as StoryblokColorPicker).color }
          : {}
      }
    >
      <span
        className={infoBarTextClasses}
        style={
          (blok?.colorPickerText as StoryblokColorPicker)?.color
            ? { color: (blok.colorPickerText as StoryblokColorPicker).color }
            : {}
        }
      >
        {RenderContent}
      </span>
    </div>
  );
};

export default InfoBarComponent;
