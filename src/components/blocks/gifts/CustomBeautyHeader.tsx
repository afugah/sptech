import { useTranslations } from 'next-intl';
import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { sectionBackgroundColorConst } from '@/src/lib/constants/storyblok';
import { type IStoryblok } from '@/src/types/framework/storyblok';
import { type CustomBeautyHeader } from '@/src/types/framework/storyblok-components';
import { isColorPicker, type StoryblokColorPicker } from '@/src/types/framework/storyblok-helpers';
import Breadcrumbs from '../../product/page/Breadcrumbs';

const CustomBeautyHeaderComponent: IStoryblok.FC<CustomBeautyHeader> = ({ blok }) => {
  const { title, description, breadcrum, backgroundColor } = blok;
  const backgroundColorClass =
    backgroundColor &&
    isColorPicker(backgroundColor) &&
    sectionBackgroundColorConst[(backgroundColor as StoryblokColorPicker).value as string];
  const t = useTranslations();
  return (
    <>
      <div
        className={`h-hero-image-category relative h-screen w-full overflow-hidden lg:h-[40rem] ${backgroundColorClass} bg-cover`}
      >
        <div className={'flex h-screen items-center justify-center pt-10 lg:h-[40rem]'}>
          <div className={'flex w-full flex-col items-center gap-y-7 px-10  font-light  sm:px-16 lg:px-72'}>
            <div className={'space-y-8'}>
              <p className={' text-center  font-serif text-3xl font-bold tracking-wider md:text-4xl lg:text-5xl'}>
                {title}
              </p>
              <p className={'text-center uppercase leading-7 '}>{description}</p>
            </div>

            {breadcrum && (
              <div className={'hidden font-semibold lg:block'}>
                <Breadcrumbs>
                  <li className={'uppercase'}>
                    <Link className={'text-black '} href={'/'}>
                      {t('common.home')}
                    </Link>
                  </li>

                  <li className={'uppercase'}>{title}</li>
                </Breadcrumbs>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomBeautyHeaderComponent;
