'use client';

import { ImageGalleryGrid } from '@/src/components/product/page/ImageGallery/Grid';
import { ImageGalleryHorizontal } from '@/src/components/product/page/ImageGallery/Horizontal';
import { ImageGalleryVertical } from '@/src/components/product/page/ImageGallery/Vertical';

export enum ImageGalleryTypeEnum {
  Vertical = 'VERTICAL',
  Horizontal = 'HORIZONTAL',
  Grid = 'GRID',
}

interface ImageGalleryPropsBase {
  galleryType: ImageGalleryTypeEnum;
  productName?: string;
}

interface ImageGalleryVerticalProps extends ImageGalleryPropsBase, React.ComponentProps<typeof ImageGalleryVertical> {
  galleryType: ImageGalleryTypeEnum.Vertical;
}

interface ImageGalleryHorizontalProps
  extends ImageGalleryPropsBase,
    React.ComponentProps<typeof ImageGalleryHorizontal> {
  galleryType: ImageGalleryTypeEnum.Horizontal;
}

interface ImageGalleryGridProps extends ImageGalleryPropsBase, React.ComponentProps<typeof ImageGalleryGrid> {
  galleryType: ImageGalleryTypeEnum.Grid;
}

type ImageGalleryProps = ImageGalleryVerticalProps | ImageGalleryHorizontalProps | ImageGalleryGridProps;

export const ImageGallery: React.FC<ImageGalleryProps> = (props) => {
  switch (props.galleryType) {
    case ImageGalleryTypeEnum.Vertical:
      return <ImageGalleryVertical {...getProps(props)} />;

    case ImageGalleryTypeEnum.Horizontal:
      return <ImageGalleryHorizontal {...getProps(props)} />;

    case ImageGalleryTypeEnum.Grid:
      return <ImageGalleryGrid {...getProps(props)} />;

    default:
      return null;
  }
};

const getProps = <T extends ImageGalleryProps>(props: T): Omit<T, 'galleryType'> => {
  const { galleryType: _, ...componentProps } = props;
  return componentProps;
};
