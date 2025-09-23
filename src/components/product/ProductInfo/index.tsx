import { isNil } from 'lodash';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ProductInfoDescription } from '@/src/components/product/ProductInfo/Description';
import { ProductInfoDetails } from '@/src/components/product/ProductInfo/Details';
import { ProductInfoMeasurements } from '@/src/components/product/ProductInfo/Measurements';
import { ProductInfo } from '@/src/components/product/ProductInfo/ProductInfo';
import { ProductInfoTab } from '@/src/components/product/ProductInfo/Tab';
import { type IProduct } from '@/src/lib/framework/Product/domain/entities/IProduct';

interface IProductInfoProps {
  product: IProduct;
}

export const ProductInfoData: React.FC<IProductInfoProps> = ({ product }) => {
  const t = useTranslations('product-page.info');

  const { description, attributes = {} } = product;

  // Helper function to format dimensional values from millimeters to centimeters
  const formatDimension = (value: string | undefined): string | undefined => {
    if (!value || isNaN(Number(value))) return value;
    const numValue = Number(value);
    return `${(numValue / 10).toFixed(1)} cm`;
  };

  // Helper function to format weight with unit
  const formatWeight = (value: string | undefined): string | undefined => {
    if (!value || isNaN(Number(value))) return value;
    return `${value} g`;
  };

  // Helper function to format material content by removing HTML tags and formatting
  const formatMaterial = (value: string | undefined): string | undefined => {
    if (!value) return value;

    // Remove HTML tags and extract text content
    const withoutTags = value.replace(/<[^>]*>/g, '');

    // If it starts with "Material:" remove that prefix since we already have it in the label
    const withoutMaterialPrefix = withoutTags.replace(/^Material:\s*/, '');

    return withoutMaterialPrefix.trim();
  };

  // Detailed information - includes description, care instructions, and general product details
  const detailedInformation = {
    description,
    careInstructions: attributes.careInstructions,
    details: {
      [t('country-of-origin')]: attributes.countryOfOrigin,
      [t('age-category')]: attributes.ageCategory,
      [t('fit')]: attributes.fit,
      [t('cut')]: attributes.cut,
      [t('sleeve-details')]: attributes.sleeveDetails,
      [t('front')]: attributes.front,
      [t('neckline')]: attributes.neckline,
      [t('pockets')]: attributes.pockets,
      [t('waist')]: attributes.waist,
      [t('quality')]: attributes.quality,
      [t('season')]: attributes.season,
    },
  };

  // Material information - all material-related attributes
  // Primary source from Typesense, fallback to existing attributes
  const materialInfo = {
    // Use Typesense material data if available, otherwise fallback to existing data
    // Don't format if it contains HTML tags (to preserve paragraph formatting)
    [t('material')]: attributes.material_typesense?.includes('<')
      ? attributes.material_typesense
      : formatMaterial(attributes.material_typesense) || attributes.materials,
  };

  // Dimensions & weight - measurements and size-related data
  // Primary source from Typesense, fallback to existing attributes
  const dimensionsAndWeight: Record<string, { value: Record<string, string> | string | undefined; unit: string }> = {
    // Physical dimensions - use Typesense data if available
    [t('diameter')]: {
      value: attributes.diameter || attributes.homeAccDiameter,
      unit: 'cm',
    },
    [t('width')]: {
      value: formatDimension(attributes.width_typesense) || attributes.width || attributes.homeAccWidth,
      unit: formatDimension(attributes.width_typesense) ? '' : 'cm',
    },
    [t('height')]: {
      value: formatDimension(attributes.height_typesense) || attributes.height || attributes.homeAccHeight,
      unit: formatDimension(attributes.height_typesense) ? '' : 'cm',
    },
    [t('depth')]: {
      value: formatDimension(attributes.length_typesense) || attributes.length || attributes.homeAccLength,
      unit: formatDimension(attributes.length_typesense) ? '' : 'cm',
    },
    [t('weight')]: {
      value: formatWeight(attributes.weight_typesense),
      unit: '',
    },
    // Garment measurements
    ...(attributes.model_size && attributes.model_length
      ? {
          '': {
            value: `${t('model-size-description')} ${attributes.model_size} ${t('model-lenght-description')} ${attributes.model_length} cm`,
            unit: '',
          },
        }
      : {}),
  };

  return (
    <ProductInfo className={'order-11 md:order-8'}>
      {/* Detailed information section */}
      <ProductInfoTab id={'detailed-information'} title={'Detailed information'} data={detailedInformation}>
        {(data) => {
          const hasDescription = data.description;
          const hasCareInstructions = data.careInstructions;
          const filteredDetails = Object.entries(data.details).filter(([key, value]) => !isNil(key) && !isNil(value));

          if (!hasDescription && !hasCareInstructions && filteredDetails.length === 0) return null;

          return (
            <div className={'space-y-4'}>
              {hasDescription && <ProductInfoDescription description={data.description} />}

              {/* USP bullet points from Typesense data */}
              {(product.attributes?.usp1 || product.attributes?.usp2 || product.attributes?.usp3) && (
                <div className={'space-y-2'}>
                  <ul className={'list-disc space-y-1 pl-5'}>
                    {product.attributes?.usp1 && <li className={'text-sm'}>{product.attributes.usp1}</li>}
                    {product.attributes?.usp2 && <li className={'text-sm'}>{product.attributes.usp2}</li>}
                    {product.attributes?.usp3 && <li className={'text-sm'}>{product.attributes.usp3}</li>}
                  </ul>
                </div>
              )}

              {hasCareInstructions && (
                <div className={'space-y-2'}>
                  <h5 className={'uppercase text-black'}>{t('washing')}</h5>
                  <div className={''}>{data.careInstructions}</div>
                </div>
              )}

              {filteredDetails.length > 0 && (
                <div className={'space-y-2'}>
                  <h5 className={'uppercase text-black'}>{t('details')}</h5>
                  <ProductInfoDetails data={filteredDetails} />
                </div>
              )}
            </div>
          );
        }}
      </ProductInfoTab>

      {/* Material section */}
      <ProductInfoTab id={'material'} title={'Material'} data={materialInfo}>
        {(data) => {
          const filteredData = Object.entries(data).filter(([key, value]) => !isNil(key) && !isNil(value));
          if (filteredData.length <= 0) return null;

          return <ProductInfoDetails data={filteredData} />;
        }}
      </ProductInfoTab>

      {/* Dimensions & weight section */}
      <ProductInfoTab id={'dimensions-weight'} title={'Dimensions & weight'} data={dimensionsAndWeight}>
        {(data) => {
          const filteredData = Object.entries(data).filter(
            ([key, item]) =>
              !isNil(key) &&
              !isNil(item.value) &&
              (typeof item.value !== 'object' || Object.keys(item.value).length > 0),
          );
          if (filteredData.length <= 0) return null;

          return <ProductInfoMeasurements data={filteredData} />;
        }}
      </ProductInfoTab>
    </ProductInfo>
  );
};
