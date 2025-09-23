import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type GiftsCardHeader } from '@/src/types/framework/storyblok-components';
import Breadcrumbs from '../../product/page/Breadcrumbs';
// import GiftCardForm from '../../profile/gifts/components/gift-cards/giftCardForm';

const GiftsHeader: IStoryblok.FC<GiftsCardHeader> = ({ blok }) => {
  const { title, subTitle, image, description } = blok;

  const t = useTranslations();

  return (
    <div className={'bg-white pb-24 pt-48'}>
      <div className={'mt-0 w-full px-5 '}>
        <div
          className={
            'grid w-full place-content-center gap-4 gap-y-8 lg:grid-cols-[1fr_530px_1fr] xl:grid-cols-[1fr_630px_1fr]'
          }
        >
          <div className={' space-y-8'}>
            <div className={'hidden lg:block'}>
              <Breadcrumbs>
                <li className={'uppercase'}>
                  <Link className={'text-black '} href={'/'}>
                    {t('common.home')}
                  </Link>
                </li>

                <li className={'uppercase'}>{title}</li>
              </Breadcrumbs>
            </div>
            <div className={'flex flex-col gap-y-4'}>
              <p className={' text-3xl font-semibold'}>{title}</p>
              <p>{subTitle}</p>
              <p className={'font-light'}>{description}</p>
            </div>
          </div>
          <div className={' -order-1 flex h-full w-full items-center justify-center lg:-order-none'}>
            <div className={' md:72 overflow-hidden rounded-xl shadow-xl   md:h-72 xl:h-80 xl:w-80 '}>
              <Image
                src={image?.filename || '/images/efva-category-1920x1080.jpg'}
                alt={''}
                width={1920}
                height={1080}
                className={'object-cover md:size-72 xl:size-80'}
              />
            </div>
          </div>
          {/* <div>
            <GiftCardForm />
          </div> */}
        </div>
      </div>
      {/* <div className={' mt-14 bg-alabaster px-6 py-10'}>
        <div className={' space-y-10'}>
          <div className={' flex w-full items-center justify-center'}>
            <p className={' text-xl font-bold'}>YOU MIGHT ALSO LIKE</p>
          </div>
          <DefaultProductsInCarousel />
        </div>
      </div> */}
    </div>
  );
};

export default GiftsHeader;
