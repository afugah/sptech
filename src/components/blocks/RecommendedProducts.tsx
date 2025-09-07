'use client';

import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import React from 'react';
import ProductCard from '@/src/components/product/ProductCard';
import { useFindifyProducts } from '@/src/hooks/useFindifyProducts';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type RecommendedProducts } from '@/src/types/framework/storyblok-components';
import { safeString } from '@/src/types/framework/storyblok-helpers';
import styles from './Grid.module.css';

export const RecommendedProductsBlok: IStoryblok.FC<RecommendedProducts> = ({ blok, ...props }) => {
  const { title, itemCount = '5', widgetId, blocks, background, titleColor, backgroundColor } = blok;
  const { products, isLoading } = useFindifyProducts(widgetId, +itemCount);

  // Handle background - could be an AssetStoryblok object or or color code or undefined
  const backgroundStyle = (background as { filename?: string })?.filename
    ? { backgroundImage: `url(${(background as { filename: string }).filename})` }
    : {};

  if (isLoading) {
    return (
      <div className={'w-full overflow-hidden bg-alabaster py-8'}>
        <div className={'flex items-center justify-center'}>
          <div className={'h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'}></div>
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div
      style={{ backgroundColor: safeString((backgroundColor as { value?: string })?.value), ...backgroundStyle }}
      className={'w-full overflow-hidden'}
    >
      {!!title && (
        <h2
          className={'pb-4 pt-6 text-center font-serif text-xl sm:pb-6 sm:pt-8 sm:text-2xl lg:text-3xl'}
          style={{ color: safeString((titleColor as { value?: string })?.value) }}
        >
          {title}
        </h2>
      )}
      <div
        className={styles.gridContainer}
        style={
          {
            '--mobile-columns': 'repeat(2, 1fr)',
            '--tablet-columns': 'repeat(3, 1fr)',
            '--desktop-columns': 'repeat(4, 1fr)',
          } as React.CSSProperties & {
            '--mobile-columns': string;
            '--tablet-columns': string;
            '--desktop-columns': string;
          }
        }
        {...storyblokEditable(blok)}
        data-test={'recommendedProducts'}
        {...props}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!!blocks?.length && (
        <div className={'px-4 pb-4'}>
          {blocks.map((block) => (
            <StoryblokComponent blok={block} key={block._uid} />
          ))}
        </div>
      )}
    </div>
  );
};
