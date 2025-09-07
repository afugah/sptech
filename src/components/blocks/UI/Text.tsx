'use client';

import classNames from 'classnames';
import React from 'react';
import { alignConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Text } from '@/src/types/framework/storyblok-components';
import { renderRichContent } from '@/src/utils/storyblok/renderRichContent';

const TextComponent: IStoryblok.FC<Text> = ({ blok }) => {
  const { content, align = 'center' } = blok;
  const textClasses = classNames(alignConst[align], 'py-3 font-light');
  const RenderContent = content?.content?.[0]?.content ? renderRichContent(content) : 'null';

  return <div className={textClasses}>{RenderContent}</div>;
};
export default TextComponent;
