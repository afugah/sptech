'use client';

import MultiColorCircle from '@images/icons/multi-color-circle.svg';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { isLightColor, isValidHexColor } from '@/src/util/color';

interface IColorVariantCircleProps {
  color: {
    baseColorCode: string;
    meta: {
      key: string;
      value: string;
    };
  };
}

export const ColorVariantCircleHex: React.FC<IColorVariantCircleProps> = ({ color }) => {
  const t = useTranslations();

  const hex = color?.meta?.value;
  const isValid = !!hex && isValidHexColor(hex);
  const isLight = !!hex && isLightColor(hex);

  return (
    <div className={`rounded-full border`} style={{ borderColor: isLight ? '#e3e3e3' : '' }}>
      <div
        className={classNames('relative aspect-square cursor-default overflow-hidden rounded-2xl')}
        style={{ height: isLight ? 7 : 8, width: isLight ? 7 : 8 }}
        title={color?.meta?.key || t('common.unknown')}
      >
        {isValid ? (
          <div
            className={'absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform'}
            style={{ backgroundColor: hex }}
          />
        ) : (
          <MultiColorCircle className={'h-full w-full'} />
        )}
      </div>
    </div>
  );
};
