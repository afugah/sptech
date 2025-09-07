'use client';

import MultiColorCircle from '@images/icons/multi-color-circle.svg';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { isLightColor, isValidColor } from '@/src/util/color';

interface IColorVariantCircleProps {
  color: string | undefined;
  title?: string;
  size?: number;

  className?: string;
}

export const ColorVariantCircle: React.FC<IColorVariantCircleProps> = ({ color, title, size = 8, className }) => {
  const t = useTranslations();
  const isValid = !!color && isValidColor(color);
  const isLight = !!color && isLightColor(color);

  return (
    <div className={`rounded-full border`} style={{ borderColor: isLight ? '#e3e3e3' : '' }}>
      <div
        className={classNames('relative aspect-square cursor-default overflow-hidden rounded-2xl', className)}
        style={{ height: size, width: size }}
        title={title || t('common.unknown')}
      >
        {isValid ? (
          <div
            className={'absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform'}
            style={{ backgroundColor: color.toLowerCase() }}
          />
        ) : (
          <MultiColorCircle className={'h-full w-full'} />
        )}
      </div>
    </div>
  );
};
