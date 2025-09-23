import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from '@/src/i18n/navigation';
import { sectionBackgroundColorConst } from '@/src/lib/constants/storyblok';
import { type ItemCardDetails, type StoryblokColorPicker } from '@/src/types/framework/storyblok-components';
import { isColorPicker, type StoryblokContent } from '@/src/types/framework/storyblok-helpers';
import { CardContent, CardFooter } from '../shadcn/card';

interface Props {
  blok: ItemCardDetails;
  backgroundColor: string;
}

const ItemCardDetailsComponent = ({ blok, backgroundColor }: Props) => {
  const { title, image, ctaButtons, description, itemDetailsBackgroundColor } = blok;

  const itemBackgroundColorClass =
    itemDetailsBackgroundColor &&
    isColorPicker(itemDetailsBackgroundColor) &&
    sectionBackgroundColorConst[(itemDetailsBackgroundColor as StoryblokColorPicker).value as string];
  return (
    <div className={`${backgroundColor || 'bg-seashell'}`}>
      <div className={'from-gray-100 relative aspect-[4/3] bg-gradient-to-br to-gray-200'}>
        <Image
          src={image?.filename || '/images/efva-category-1920x1080.jpg'}
          alt={image?.alt || ''}
          fill
          className={'object-cover'}
        />
      </div>

      <div className={'h-full px-4 md:px-5'}>
        <div className={cn('relative -top-10 h-full   md:min-h-[5rem] ', itemBackgroundColorClass || 'bg-[#ece0db]')}>
          <div className={'px-2'}>
            <CardContent className={' mb-4 space-y-2 p-4  text-center'}>
              <p className={'mb-0 font-serif text-2xl font-medium uppercase'}>{title}</p>
              {description && <p className={' font-light leading-relaxed'}>{description}</p>}
            </CardContent>
            {ctaButtons?.map((button, index: number) => (
              <CardFooter key={button._uid || index} className={'justify-center pb-3'}>
                <Link
                  href={`/${((button?.url as StoryblokContent)?.url as string) || ''}`}
                  className={
                    'bg-gray-800 px-3 py-3 text-sm font-medium uppercase text-white transition-colors hover:bg-gray-800'
                  }
                >
                  {(button?.text as string) || ''}
                </Link>
              </CardFooter>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCardDetailsComponent;
