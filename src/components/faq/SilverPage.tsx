'use client';

import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import FaqCarousel from '@/src/components/faq/FaqCarousel';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { type StoryblokStory } from '@/src/lib/storyblok/fetchStoryBlokStory';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import { renderRichContent, richContentPresets } from '@/src/utils/storyblok/renderRichContent';

interface FaqBlockImage {
  filename: string;
  alt?: string;
}

interface FaqBlock {
  title: string;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: StoryblokRichtext;
  image?: FaqBlockImage;
  component?: string;
  slug?: string;
  _uid?: string;
}

interface SilverPageProps {
  story?: StoryblokStory<CmsPage>;
}

const SilverPage: React.FC<SilverPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const silverExplainedBlock = blocks.find((block) => block.slug === 'introduction');
  const recycledSilverBlock = blocks.find((block) => block.slug === 'recycled');

  const whiteGoldBlock = blocks.find((block) => block.slug === 'white-gold');
  const yellowGoldBlock = blocks.find((block) => block.slug === 'swedish-yellow-gold');
  const productBlock = blocks.find((block) => block.slug === 'products');

  const carouselBlocks = [whiteGoldBlock, yellowGoldBlock].filter(Boolean) as FaqBlock[];

  return (
    <div className={'min-h-screen  bg-backgroundAlternative '}>
      <div className={'bg-seashell pb-8 md:pb-32'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-2xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
            {description as string}
          </p>
          <Breadcrumbs
            className={
              'mb-6 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest md:mb-10'
            }
          >
            <li>
              <a href={'/'} className={'uppercase hover:underline'}>
                {t('common.home')}
              </a>
            </li>
            <li className={'text-xxs'}>{title}</li>
          </Breadcrumbs>
        </div>
      </div>

      <div>
        {silverExplainedBlock && (
          <div className={'relative bg-backgroundAlternative pb-8 md:px-28 md:pb-56 md:pt-20'}>
            {silverExplainedBlock.image && (
              <div
                className={
                  'absolute -top-12 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={silverExplainedBlock.image.filename}
                  alt={silverExplainedBlock.image.alt || silverExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-96 md:pt-24 lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-1 text-sm font-bold leading-6 text-gray-900 md:text-base'}>
                    {silverExplainedBlock.title}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {silverExplainedBlock.description}
                  </p>
                  {silverExplainedBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {silverExplainedBlock.paragraph1}
                    </p>
                  )}
                  {silverExplainedBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {silverExplainedBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
              {silverExplainedBlock.image && (
                <div className={'absolute -top-16 right-4 hidden lg:block xl:right-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={silverExplainedBlock.image.filename}
                    alt={silverExplainedBlock.image.alt || silverExplainedBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {(bannerImage as StoryblokImage)?.filename && (
          <div className={'mb-10 md:mb-20'}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[500px]'}
                width={1200}
                height={400}
                src={(bannerImage as StoryblokImage)?.filename || ''}
                alt={(bannerImage as StoryblokImage)?.alt || 'Banner'}
              />
            </div>
          </div>
        )}

        {recycledSilverBlock && (
          <div className={'relative relative pb-8 md:px-28 md:pb-40 md:pt-20'}>
            {recycledSilverBlock.image && (
              <div
                className={
                  'absolute -top-24 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={recycledSilverBlock.image.filename}
                  alt={recycledSilverBlock.image.alt || recycledSilverBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-80 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <p className={'text-sm font-bold leading-6 text-gray-900 md:text-base'}>
                    {recycledSilverBlock.title}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {recycledSilverBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {recycledSilverBlock.paragraph1}
                  </p>
                  {recycledSilverBlock.paragraph3 &&
                    renderRichContent(recycledSilverBlock.paragraph3, richContentPresets.faq)}
                </div>
              </div>
              {recycledSilverBlock.image && (
                <div className={'absolute bottom-28 left-4 hidden lg:block xl:left-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={recycledSilverBlock.image.filename}
                    alt={recycledSilverBlock.image.alt || recycledSilverBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {productBlock && <StoryblokComponent blok={productBlock} key={productBlock._uid} />}

        {carouselBlocks.length > 0 && (
          <FaqCarousel
            items={carouselBlocks}
            headerText={t('faq.more-about-our-materials')}
            backgroundColor={'bg-white'}
            urlPath={'/faq/materials'}
            buttonText={t('common.full-story')}
          />
        )}
      </div>
    </div>
  );
};

export default SilverPage;
