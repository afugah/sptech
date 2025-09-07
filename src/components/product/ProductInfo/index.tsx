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

  const details = {
    [t('diameter')]: attributes.diameter ? `${attributes.diameter} cm` : undefined,
    [t('width')]: attributes.width ? `${attributes.width} cm` : undefined,
    [t('height')]: attributes.height ? `${attributes.height} cm` : undefined,
    [t('length')]: attributes.length ? `${attributes.length} cm` : undefined,
    [t('length')]: attributes.homeAccLength ? `${attributes.homeAccLength} cm` : undefined,
    [t('width')]: attributes.homeAccWidth ? `${attributes.homeAccWidth} cm` : undefined,
    [t('diameter')]: attributes.homeAccDiameter ? `${attributes.homeAccDiameter} cm` : undefined,
    [t('height')]: attributes.homeAccHeight ? `${attributes.homeAccHeight} cm` : undefined,
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
    [t('cord-length')]: attributes.cordLength ? `${attributes.cordLength} cm` : undefined,
    [t('material')]: attributes.materials,
    [t('material-back')]: attributes.material_back,
    [t('material-body')]: attributes.material_body,
    [t('material-decoration')]: attributes.material_decoration,
    [t('material-fill')]: attributes.material_fill,
    [t('material-front')]: attributes.material_front,
    [t('material-lining')]: attributes.material_lining,
    [t('material-main')]: attributes.material_main,
    [t('material-other')]: attributes.material_other,
    [t('material-shell')]: attributes.material_shell,
    [t('material-sleeves')]: attributes.material_sleeves,
    [t('material-upper')]: attributes.material_upper,
    [t('material-bottom')]: attributes.material_bottom,
  };

  const washing = [attributes.careInstructions];

  const measurements: Record<string, { value: Record<string, string> | string | undefined; unit: string }> = {
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
        JSON.stringify(attributes.garmentLength) ===
          JSON.stringify({ XS: 0, S: 0, M: 0, L: 0, XL: 0, 'S/M': 0, 'M/L': 0, 'One size': 0 })
          ? undefined
          : attributes.garmentLength,
      unit: 'cm',
    },
    [t('chest-width')]: {
      value:
        attributes.chestWidth &&
        JSON.stringify(attributes.chestWidth) ===
          JSON.stringify({ XS: 0, S: 0, M: 0, L: 0, XL: 0, 'S/M': 0, 'M/L': 0, 'One size': 0 })
          ? undefined
          : attributes.chestWidth,
      unit: 'cm',
    },
    [t('sleeve-length')]: {
      value: attributes.sleeveLength,
      unit: 'cm',
    },
    // [t('model-length')]: {
    //   value: `${attributes.model_length} cm`,
    //   unit: 'cm',
    // },
    // [t('model-size')]: {
    //   value: attributes.model_size,
    //   unit: '',
    // },
  };

  return (
    <ProductInfo className={'order-11 md:order-8'}>
      <ProductInfoTab id={'description'} title={t('about-product')} data={description}>
        {(description) => <ProductInfoDescription description={description} />}
      </ProductInfoTab>

      <ProductInfoTab id={'details'} title={t('details')} data={details}>
        {(data) => {
          const filteredData = Object.entries(data).filter(([key, value]) => !isNil(key) && !isNil(value));
          if (filteredData.length <= 0) return null;

          return <ProductInfoDetails data={filteredData} />;
        }}
      </ProductInfoTab>

      <ProductInfoTab id={'washing'} title={t('washing')} data={washing}>
        {(data) => {
          const filteredData = data.filter((value) => !isNil(value));
          if (filteredData.length <= 0) return null;

          return (
            <div className={'flex flex-col gap-2 text-xs'}>
              {filteredData.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          );
        }}
      </ProductInfoTab>

      <ProductInfoTab id={'measurements'} title={t('measurements')} data={measurements}>
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
