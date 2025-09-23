import { type SbBlokData, storyblokEditable } from '@storyblok/react';
import Image from 'next/image';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type CollectionItem } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import { Card } from '../shadcn/card';

interface ShoplabCollectionItemProps {
  blok: CollectionItem & SbBlokData;
  titleColor: string;
}

const ShoplabCollectionItem: React.FC<ShoplabCollectionItemProps> = ({ blok, titleColor, ...props }) => {
  const { collectionTitleColor, image, slug, title } = blok;
  const fallbackTitleColor = titleColor || '#000000';

  return (
    <Card className={'overflow-hidden rounded-none border-none shadow-none'} {...storyblokEditable(blok)} {...props}>
      <Link href={`/${slug}`} className={'relative block aspect-[3/4]'}>
        <Image
          src={(image as StoryblokImage)?.filename || ''}
          alt={`${(title as string)?.split(' ')[0]} - ${process.env.NEXT_PUBLIC_STORE_NAME || ''}`}
          fill
          className={'object-cover'}
          priority
        />
        <div className={'absolute -left-2 top-0 z-20 flex h-full w-12 items-center justify-center md:left-2'}>
          <span
            className={'z-20 block -rotate-90 transform whitespace-pre text-sm font-bold tracking-wide'}
            style={{ color: (collectionTitleColor as { value?: string })?.value || fallbackTitleColor }}
          >
            {title as string}
          </span>
        </div>
      </Link>
    </Card>
  );
};

export default ShoplabCollectionItem;
