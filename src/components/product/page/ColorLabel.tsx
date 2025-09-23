'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ColorVariantCircle } from '@/src/components/ui/ColorVariantCircle';
import { Link } from '@/src/i18n/navigation';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

interface ColorLabelProps {
  product: IProduct;
}

const ColorLabel: React.FC<ColorLabelProps> = ({ product }) => {
  const t = useTranslations();
  const colors =
    product.productColors
      ?.filter((color) => (product.isVariantAsImage ? !!color.image : !!color.baseColorCode?.value))
      .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')) ?? [];

  return (
    <>
      <div className={'mb-3 flex items-center text-sm uppercase'}>
        {t('product-page.color')}: <span className={'ml-2 text-gray'}>{product.baseColorCode?.title}</span>
      </div>

      {colors?.length > 1 && (
        <div className={'mb-5 flex flex-wrap items-center gap-x-4 py-1'}>
          {colors.map((color) => {
            const { sku, slug, title, image, baseColorCode } = color;
            const isCurrent = color.sku === product.sku;

            if (product.isVariantAsImage && image)
              return (
                <Link
                  key={sku}
                  href={slug}
                  title={title}
                  className={classNames('h-[100px] w-auto overflow-hidden', {
                    'border border-gray-300': isCurrent,
                  })}
                >
                  <Image unoptimized src={image} alt={title} width={72} height={100} />
                </Link>
              );
            else if (!product.isVariantAsImage && baseColorCode?.value)
              return (
                <Link
                  href={slug}
                  key={sku}
                  className={classNames(
                    `flex h-[30px] w-[30px] items-center justify-center rounded-full`,
                    `border ${isCurrent ? 'border-secondary-600' : 'border-gray-200'} border-opacity-20`,
                  )}
                >
                  <ColorVariantCircle
                    color={baseColorCode.value}
                    title={title}
                    size={16}
                    className={classNames('cursor-pointer', { 'opacity-50': !isCurrent })}
                  />
                </Link>
              );
            else return null;
          })}
        </div>
      )}
    </>
  );
};

export default ColorLabel;
