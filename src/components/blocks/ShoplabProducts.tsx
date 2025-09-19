'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/shadcn/carousel';
import { sectionBackgroundColorConst, sizeConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type ShoplabProducts, type StoryblokColorPicker } from '@/src/types/framework/storyblok-components';
import { isColorPicker } from '@/src/types/framework/storyblok-helpers';
import ProductCard from '../product/ProductCard';
import TitleSubtitle from '../product/TitleSubtitle';

const ShoplabProductsComponent: IStoryblok.FC<ShoplabProducts> = ({ blok }) => {
  const {
    title,
    background,
    newTitleColor,
    titleSize,
    backgroundColor,
    itemsPerView,
    products,
    layoutMode,
    showColorSelector,
    showWishlist,
    showTags,
    showAddToCart,
    showPrice,
  } = blok;

  const _ItemCount = Number(itemsPerView) || 4;

  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];

  const getTitleColor =
    isColorPicker(newTitleColor) && (newTitleColor as StoryblokColorPicker)?.color
      ? (newTitleColor as StoryblokColorPicker)?.color
      : '#000000';

  const titleSizeClass = (titleSize && sizeConst[titleSize]) || 'text-4xl sm:text-6xl  md:text-8xl lg:text-9xl';
  const checLayoutMode = itemsPerView && (Number(itemsPerView) as number) < 4 ? 'grid' : layoutMode || 'grid';
  type ProductItem = { image: string; name: string; id: string; price: string; product_sku: string };
  const productsData = products as { items?: ProductItem[] } | undefined;

  // Background logic: if backgroundImage exists, use backgroundColor; otherwise use backgroundImage
  const hasBackgroundImage = background?.filename;
  const backgroundStyle =
    hasBackgroundImage && !backgroundColorClass ? { backgroundImage: `url(${background.filename})` } : {};
  const finalBackgroundClass =
    backgroundColor && !hasBackgroundImage
      ? backgroundColorClass
      : !backgroundColorClass && !hasBackgroundImage
        ? 'bg-white'
        : 'bg-transparent';

  // Handle both array and object with items property
  const displayProducts = Array.isArray(products) ? products : productsData?.items;

  const getGridColsClass = (cols: number) => {
    const gridColsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridColsMap[cols as keyof typeof gridColsMap] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  if (checLayoutMode === 'carousel') {
    return (
      <div style={backgroundStyle} className={cn('relative w-full py-2', finalBackgroundClass || 'bg-seashell')}>
        <TitleSubtitle title={title} titleColor={getTitleColor} titleSize={titleSizeClass} />
        {displayProducts && displayProducts.length > 0 && (
          <Carousel
            className={cn('w-full bg-transparent px-9 md:px-14')}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
            }}
          >
            <div className={'px-3'}>
              <CarouselContent className={'-ml-2 bg-transparent lg:-ml-1'}>
                {displayProducts?.map((product) => {
                  // Check if it's a Storyblok product - products from Storyblok only have minimal data (id, name, image)
                  // while Typesense products have full data (sku, title, slug, etc.)
                  const isStoryblokProduct = !product.sku && !product.slug && product.id;

                  // For Storyblok products, only pass the minimal data needed for fetching
                  const productData = isStoryblokProduct
                    ? {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                      }
                    : product;

                  return (
                    <CarouselItem
                      key={product.id}
                      className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                    >
                      <ProductCard
                        product={productData}
                        showColorSelector={showColorSelector}
                        showWishlist={showWishlist}
                        showTags={showTags}
                        showAddToCart={showAddToCart}
                        showPrice={showPrice}
                        variant={isStoryblokProduct ? 'storyblok' : 'default'}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious className={'hidden lg:flex'} />
              <CarouselNext className={'hidden lg:flex'} />
            </div>

            <CarouselDots className={'ml-4 flex w-full justify-start lg:hidden'} />
          </Carousel>
        )}
      </div>
    );
  }

  return (
    <div style={backgroundStyle} className={cn('relative w-full py-2', finalBackgroundClass || 'bg-seashell')}>
      <TitleSubtitle title={title} titleColor={getTitleColor} titleSize={titleSizeClass} />
      {displayProducts && displayProducts.length > 0 && (
        <div className={`hidden w-full lg:block`}>
          <div className={cn('grid gap-2 gap-y-2', getGridColsClass(Number(itemsPerView)))}>
            {displayProducts?.map((product) => {
              // Check if it's a Storyblok product - products from Storyblok only have minimal data (id, name, image)
              // while Typesense products have full data (sku, title, slug, etc.)
              const isStoryblokProduct = !product.sku && !product.slug && product.id;

              // For Storyblok products, only pass the minimal data needed for fetching
              const productData = isStoryblokProduct
                ? {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                  }
                : product;

              return (
                <div key={product.id} className={''}>
                  <ProductCard
                    product={productData}
                    showColorSelector={showColorSelector}
                    showWishlist={showWishlist}
                    showTags={showTags}
                    showAddToCart={showAddToCart}
                    showPrice={showPrice}
                    variant={isStoryblokProduct ? 'storyblok' : 'default'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={'block lg:hidden'}>
        {displayProducts && displayProducts.length > 0 && (
          <Carousel
            className={cn('w-full bg-transparent px-0 md:px-0')}
            opts={{
              align: 'start',
              loop: false,
              slidesToScroll: 1,
            }}
          >
            <div className={'px-3'}>
              <CarouselContent className={'-ml-2 bg-transparent'}>
                {displayProducts?.map((product) => {
                  // Check if it's a Storyblok product - products from Storyblok only have minimal data (id, name, image)
                  // while Typesense products have full data (sku, title, slug, etc.)
                  const isStoryblokProduct = !product.sku && !product.slug && product.id;

                  // For Storyblok products, only pass the minimal data needed for fetching
                  const productData = isStoryblokProduct
                    ? {
                        id: product.id,
                        name: product.name,
                        image: product.image,
                      }
                    : product;

                  return (
                    <CarouselItem
                      key={product.id}
                      className={'basis-1/2 pl-2 sm:pl-4 md:basis-[33.1%] md:pl-6 lg:basis-[25%]'}
                    >
                      <ProductCard
                        product={productData}
                        showColorSelector={showColorSelector}
                        showWishlist={showWishlist}
                        showTags={showTags}
                        showAddToCart={showAddToCart}
                        showPrice={showPrice}
                        variant={isStoryblokProduct ? 'storyblok' : 'default'}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious className={'hidden lg:flex'} />
              <CarouselNext className={'hidden lg:flex'} />
            </div>

            <CarouselDots className={' lg:hidden'} />
          </Carousel>
        )}
      </div>
    </div>
  );
};
export default ShoplabProductsComponent;
