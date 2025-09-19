'use client';

import { storyblokEditable } from '@storyblok/react';
import classNames from 'classnames';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link } from '@/src/i18n/navigation';
import {
  backgroundColorConst,
  borderConst,
  buttonSizeConst,
  fontConst,
  marginBottomConst,
  marginConst,
  marginTopConst,
  opacityConst,
} from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type Button as ButtonType } from '@/src/types/framework/storyblok-components';
import { type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
import { Button } from '../../shadcn/button';

const ButtonBlok: IStoryblok.FC<ButtonType> = ({ blok }) => {
  const {
    text,
    url,
    opacity,
    font = 'base',
    colorPickerText,
    colorPickerBackground,
    colorPickerBorder,
    shadow,
    underline,
    marginBottom,
    marginTop,
    size = 'medium',
    backgroundColor,
    border,
    marginRight,
    rounded,
    icon,
    iconColor,
  } = blok;

  const linkClasses = classNames(
    (colorPickerText as { value?: string })?.value ? '' : 'text-black',
    fontConst[font],
    'inline-block',
  );

  const buttonClasses = classNames(
    opacityConst[(opacity as { value?: number })?.value ?? 10],
    fontConst[font],
    (colorPickerText as { value?: string })?.value ? '' : 'text-white',
    (colorPickerBackground as { value?: string })?.value ? '' : 'bg-gray-900',
    shadow ? 'drop-shadow-md' : '',
    underline ? 'underline underline-offset-8 decoration-from-font' : '',
    marginBottomConst[(marginBottom as { value?: number })?.value ?? 0],
    marginTopConst[(marginTop as { value?: number })?.value ?? 0],
    buttonSizeConst[size],
    borderConst[(border as { value?: number })?.value ?? 0],
    (colorPickerBorder as { color?: string })?.color ? '' : 'border-white',
    backgroundColorConst[(backgroundColor as { value?: string })?.value ?? '#000000'],
    marginConst[(marginRight as { value?: number })?.value ?? 0],
    rounded ? 'rounded-full' : '',
    'uppercase font-sans',
  );

  const href = useMemo(() => {
    if (!url) return '#';

    if (url.cached_url) {
      return `/${url.cached_url}`;
    }

    return 'story' in url
      ? `/${(url as unknown as Record<string, unknown>).story as string}`
      : ((url as unknown as Record<string, unknown>).url as string);
  }, [url]);

  return (
    <Link
      href={href}
      className={linkClasses}
      style={
        (colorPickerText as { value?: string })?.value ? { color: (colorPickerText as { value: string }).value } : {}
      }
    >
      <Button
        className={buttonClasses}
        {...storyblokEditable(blok)}
        data-test={'button'}
        style={{
          ...((colorPickerBackground as { value?: string })?.value
            ? { backgroundColor: (colorPickerBackground as { value: string }).value }
            : {}),
          ...((colorPickerText as StoryblokColorPicker)?.value
            ? { color: (colorPickerText as StoryblokColorPicker).value as string }
            : {}),
          ...((colorPickerBorder as StoryblokColorPicker)?.color
            ? { borderColor: (colorPickerBorder as StoryblokColorPicker).color }
            : {}),
        }}
      >
        {icon === 'arrow_left' && (
          <ArrowLeft
            className={'ml-2 h-6 w-6'}
            style={{ color: (iconColor as StoryblokColorPicker)?.value as string }}
          />
        )}
        {text}
        {icon === 'arrow_right' && (
          <ArrowRight
            className={'ml-2 h-6 w-6'}
            style={{ color: (iconColor as StoryblokColorPicker)?.value as string }}
          />
        )}
      </Button>
    </Link>
  );
};

export default ButtonBlok;
