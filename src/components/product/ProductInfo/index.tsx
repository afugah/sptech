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
  // TODO: Replace with Typesense data when available
  // This section will be populated from Typesense search index for better performance and filtering
  const materialInfo = {
    [t('material')]: attributes.materials,
    [t('material-main')]: attributes.material_main,
    [t('material-back')]: attributes.material_back,
    [t('material-body')]: attributes.material_body,
    [t('material-decoration')]: attributes.material_decoration,
    [t('material-fill')]: attributes.material_fill,
    [t('material-front')]: attributes.material_front,
    [t('material-lining')]: attributes.material_lining,
    [t('material-other')]: attributes.material_other,
    [t('material-shell')]: attributes.material_shell,
    [t('material-sleeves')]: attributes.material_sleeves,
    [t('material-upper')]: attributes.material_upper,
    [t('material-bottom')]: attributes.material_bottom,
  };

  // Dimensions & weight - measurements and size-related data
  // TODO: Replace with Typesense data when available
  // This section will be populated from Typesense search index for improved search and filtering capabilities
  const dimensionsAndWeight: Record<string, { value: Record<string, string> | string | undefined; unit: string }> = {
    // Physical dimensions
    [t('diameter')]: {
      value: attributes.diameter || attributes.homeAccDiameter,
      unit: 'cm',
    },
    [t('width')]: {
      value: attributes.width || attributes.homeAccWidth,
      unit: 'cm',
    },
    [t('height')]: {
      value: attributes.height || attributes.homeAccHeight,
      unit: 'cm',
    },
    [t('length')]: {
      value: attributes.length || attributes.homeAccLength,
      unit: 'cm',
    },
    [t('cord-length')]: {
      value: attributes.cordLength,
      unit: 'cm',
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
    [t('garment-length')]: {
      value:
        attributes.garmentLength &&
        JSON.stringify(attributes.garmentLength) !==
          JSON.stringify({ XS: 0, S: 0, M: 0, L: 0, XL: 0, 'S/M': 0, 'M/L': 0, 'One size': 0 })
          ? attributes.garmentLength
          : undefined,
      unit: 'cm',
    },
    [t('chest-width')]: {
      value:
        attributes.chestWidth &&
        JSON.stringify(attributes.chestWidth) !==
          JSON.stringify({ XS: 0, S: 0, M: 0, L: 0, XL: 0, 'S/M': 0, 'M/L': 0, 'One size': 0 })
          ? attributes.chestWidth
          : undefined,
      unit: 'cm',
    },
    [t('sleeve-length')]: {
      value: attributes.sleeveLength,
      unit: 'cm',
    },
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
