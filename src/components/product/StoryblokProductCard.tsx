'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { ColorSelector } from '@/src/components/product/ColorSelector';
import { useElasticProductData } from '@/src/hooks/useElasticProductData';
import { useTypesenseProductData } from '@/src/hooks/useTypesenseProductData';
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
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Check if Typesense is enabled
  const useTypesense = process.env.NEXT_PUBLIC_USE_DIRECT_TYPESENSE_API === 'true';

  // Use Typesense or Elastic based on configuration
  const {
    product: elasticProduct,
    loading: elasticLoading,
    error: elasticError,
  } = useElasticProductData(useTypesense ? null : id);
  const {
    product: typesenseProduct,
    loading: typesenseLoading,
    error: typesenseError,
  } = useTypesenseProductData(useTypesense ? id : null);

  // Determine which product data to use
  const dataProduct = useTypesense ? typesenseProduct : elasticProduct;
  const loading = useTypesense ? typesenseLoading : elasticLoading;
  const error = useTypesense ? typesenseError : elasticError;

  // Show loading state while fetching product data
  if (loading) {
    return <div className={'bg-gray-100 h-96 animate-pulse rounded'} />;
  }

  // If no product found, return null in production or show debug info in development
  if (error && !dataProduct) {
    // Only show debug information in non-production environments
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
      return (
        <div className={'bg-red-50 border-red-200 flex h-full flex-col items-center justify-center rounded border p-4'}>
          <div className={'text-red-700 text-center'}>
            <h3 className={'text-sm font-bold'}>Product Not Found</h3>
            <p className={'mt-2 text-sm'}>Product ID: {id}</p>
            <p className={'mt-2 text-sm text-gray-600'}>Product: {name}</p>
            <p className={'mt-1 text-sm text-red-600'}>
              No product found in {useTypesense ? 'Typesense' : 'Elastic'} search
            </p>
          </div>
        </div>
      );
    }
    // In production, silently return null to hide the product card
    return null;
  }

  // Determine source and data
  let baseProduct;
  let productGroupProducts;
  let dataSource: 'elastic' | 'typesense' | 'storyblok' = useTypesense ? 'typesense' : 'elastic';

  if (dataProduct) {
    // We have data from search engine (Typesense or Elastic)
    baseProduct = {
      id: dataProduct.id,
      sku: dataProduct.sku,
      slug: dataProduct.slug,
      title: dataProduct.title,
      price: dataProduct.price,
      thumbnail: {
        url: hoveredImage || dataProduct.thumbnail?.url || '',
        hoverUrl: dataProduct.thumbnail?.hoverUrl,
      },
      tags: dataProduct.tags,
      compareAt: dataProduct.compareAt,
      pricing: dataProduct.pricing as IFindify.PricingStructure | undefined,
      created_at: typeof dataProduct.created_at === 'string' ? dataProduct.created_at : undefined,
      custom_fields: dataProduct.custom_fields,
    };
    // Get product group products if available
    productGroupProducts = dataProduct.productGroupProducts;
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
        url: hoveredImage || image,
        hoverUrl: image,
      },
      tags: [name.split(' ')[0]],
      compareAt: undefined,
      pricing: undefined,
      created_at: undefined,
    };
    productGroupProducts = undefined;
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

        {/* Color Selector for product group variants */}
        {productGroupProducts && productGroupProducts.length > 1 && (
          <ColorSelector
            productGroupProducts={productGroupProducts}
            currentProductId={baseProduct.id}
            onImageHover={setHoveredImage}
            className={'mb-2'}
          />
        )}

        {/* Only show price if we have data from search engine (not Storyblok only) */}
        {(dataSource === 'elastic' || dataSource === 'typesense') && (
          <ProductPrice
            price={0} // Don't use the base price as it's hardcoded to SEK
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
