'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { useElasticProductData } from '@/src/hooks/useElasticProductData';
import { type IFindify } from '@/src/lib/framework/Collection/types/IFindify';
import { ProductCardBase, ProductPrice, ProductSourceLabel } from './shared';

interface StoryblokProductData {
  image: string;
  name: string;
  id: string;
  price: string;
  product_sku: string;
  subtitle: string;
}

interface ICardProps {
  product: StoryblokProductData;
}

const StoryblokProductCardComponent: React.FC<ICardProps> = ({ product }) => {
  const { name, image, id } = product;
  const showDates = useSearchParams().get('showDates') === 'true';

  const { product: elasticProduct, loading: elasticLoading, error } = useElasticProductData(id); // Get product data from Elastic using product ID

  // Show loading state while fetching product data
  if (elasticLoading) {
    return <div className={'bg-gray-100 h-96 animate-pulse rounded'} />;
  }

  // If no product found in Elastic, return null in production or show debug info in development
  if (error && !elasticProduct) {
    // Only show debug information in non-production environments
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
      return (
        <div className={'bg-red-50 border-red-200 flex h-full flex-col items-center justify-center rounded border p-4'}>
          <div className={'text-red-700 text-center'}>
            <h3 className={'text-sm font-bold'}>Product Not Found</h3>
            <p className={'mt-2 text-xs'}>Product ID: {id}</p>
            <p className={'mt-2 text-xs text-gray-600'}>Product: {name}</p>
            <p className={'mt-1 text-xs text-red-600'}>No product found in Elastic search</p>
          </div>
        </div>
      );
    }
    // In production, silently return null to hide the product card
    return null;
  }

  // Determine source and data
  let baseProduct;
  let dataSource: 'elastic' | 'storyblok' = 'elastic';

  if (elasticProduct) {
    // We have data from Elastic search
    baseProduct = {
      id: elasticProduct.id,
      sku: elasticProduct.sku,
      slug: elasticProduct.slug,
      title: elasticProduct.title,
      price: elasticProduct.price,
      thumbnail: elasticProduct.thumbnail,
      tags: elasticProduct.tags,
      compareAt: elasticProduct.compareAt,
      pricing: elasticProduct.pricing as IFindify.PricingStructure | undefined,
      created_at: typeof elasticProduct.created_at === 'string' ? elasticProduct.created_at : undefined,
      custom_fields: elasticProduct.custom_fields,
    };
  } else {
    // Fallback to Storyblok data only
    dataSource = 'storyblok';
    baseProduct = {
      id: id,
      sku: id, // Use product ID as SKU fallback
      slug: `/p/product-${id}`,
      title: name,
      price: undefined, // No price from Storyblok - will not display price
      thumbnail: {
        url: image,
        hoverUrl: image,
      },
      tags: [name.split(' ')[0]],
      compareAt: undefined,
      pricing: undefined,
      created_at: undefined,
    };
  }

  return (
    <ProductCardBase
      product={baseProduct}
      showWishlist={true}
      showTags={true}
      showDate={showDates}
      showSalePrice={true}
      wishlistCheckBy={'id'}
    >
      <div className={'flex flex-col gap-1'}>
        <ProductSourceLabel source={dataSource} className={'mb-1 self-start'} />
        {/* Only show price if we have data from Elastic (not Storyblok only) */}
        {dataSource === 'elastic' && (
          <ProductPrice
            price={0} // Don't use the base price from Elastic as it's hardcoded to SEK
            compareAt={baseProduct.compareAt}
            pricing={baseProduct.pricing}
            customFields={baseProduct.custom_fields}
            showSalePrice={true}
          />
        )}
        {dataSource === 'storyblok' && <p className={'text-sm text-gray-500'}>Price not available</p>}
      </div>
    </ProductCardBase>
  );
};

const StoryblokProductCard: React.FC<ICardProps> = (props) => {
  return (
    <Suspense fallback={<div className={'bg-gray-100 h-96 animate-pulse rounded'} />}>
      <StoryblokProductCardComponent {...props} />
    </Suspense>
  );
};

export default StoryblokProductCard;
