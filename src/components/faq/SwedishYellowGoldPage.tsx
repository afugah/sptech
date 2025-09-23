'use client';

import { StoryblokComponent } from '@storyblok/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import { Button } from '@/components/shadcn/button';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { Link } from '@/src/i18n/navigation';
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

interface SwedishYellowGoldPageProps {
  story?: StoryblokStory<CmsPage>;
}

const SwedishYellowGoldPage: React.FC<SwedishYellowGoldPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const introductionBlock = blocks.find((block) => block.slug === 'introduction');
  const yellowGoldExplainedBlock = blocks.find((block) => block.slug === 'yellow-gold-explained');
  const swedishYelloGoldBlock = blocks.find((block) => block.slug === 'swedish-yellow-gold');
  const durabilityBlock = blocks.find((block) => block.slug === 'durability');

  const silverBlock = blocks.find((block) => block.slug === 'silver');
  const productBlock = blocks.find((block) => block.slug === 'products');

  return (
    <div className={'min-h-screen bg-porcelain'}>
      <div className={'bg-creme-200 pb-8 md:pb-32'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-2xl text-center text-sm uppercase leading-6 md:text-sm md:leading-8'}>
            {description as string}
          </p>
          <Breadcrumbs
            className={'mb-6 flex items-center justify-center text-center text-sm font-bold uppercase md:mb-10'}
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
        {introductionBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-60 md:pt-20'}>
            {introductionBlock.image && (
              <div
                className={
                  'absolute -top-12 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={introductionBlock.image.filename}
                  alt={introductionBlock.image.alt || introductionBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-96 md:pt-24 lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.description}
                  </p>
                  {introductionBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {introductionBlock.paragraph1}
                    </p>
                  )}
                  {introductionBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {introductionBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
              {introductionBlock.image && (
                <div className={'absolute -top-16 right-4 hidden lg:block xl:right-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={introductionBlock.image.filename}
                    alt={introductionBlock.image.alt || introductionBlock.title}
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
                height={500}
                src={(bannerImage as StoryblokImage)?.filename || ''}
                alt={(bannerImage as StoryblokImage)?.alt || 'Banner'}
              />
            </div>
          </div>
        )}

        {yellowGoldExplainedBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-40 md:pt-20'}>
            {yellowGoldExplainedBlock.image && (
              <div
                className={
                  'absolute -top-24 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={yellowGoldExplainedBlock.image.filename}
                  alt={yellowGoldExplainedBlock.image.alt || yellowGoldExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-80 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>
                    {yellowGoldExplainedBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {yellowGoldExplainedBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {yellowGoldExplainedBlock.paragraph1}
                  </p>
                  {yellowGoldExplainedBlock.paragraph3 &&
                    renderRichContent(yellowGoldExplainedBlock.paragraph3, richContentPresets.faq)}
                </div>
              </div>
              {yellowGoldExplainedBlock.image && (
                <div className={'absolute bottom-10 left-4 hidden lg:block xl:left-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={yellowGoldExplainedBlock.image.filename}
                    alt={yellowGoldExplainedBlock.image.alt || yellowGoldExplainedBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {swedishYelloGoldBlock && (
          <div className={'md:py-2'}>
            <div className={'mx-auto px-4 md:px-12'}>
              <div className={'grid grid-cols-1 gap-12 md:mr-20 lg:grid-cols-2 lg:gap-24'}>
                {swedishYelloGoldBlock.image && (
                  <div className={'order-1 lg:order-1'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[500px]'}
                      width={600}
                      height={500}
                      src={swedishYelloGoldBlock.image.filename}
                      alt={swedishYelloGoldBlock.image.alt || swedishYelloGoldBlock.title}
                    />
                  </div>
                )}
                <div className={'order-2 flex flex-col justify-center lg:order-2'}>
                  <h3 className={'mb-6 text-3xl font-light md:text-5xl'}>{swedishYelloGoldBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {swedishYelloGoldBlock.description}
                  </p>
                  {swedishYelloGoldBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {swedishYelloGoldBlock.paragraph1}
                    </p>
                  )}
                  {swedishYelloGoldBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {swedishYelloGoldBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {durabilityBlock && (
          <div className={'md:py-24'}>
            <div className={'mx-auto px-4 md:px-12'}>
              <div className={'grid grid-cols-1 gap-12 md:ml-20 lg:grid-cols-2 lg:gap-16'}>
                <div className={'order-2 flex flex-col justify-center lg:order-1'}>
                  {durabilityBlock.paragraph3 && renderRichContent(durabilityBlock.paragraph3, richContentPresets.faq)}
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {durabilityBlock.description}
                  </p>
                </div>
                {durabilityBlock.image && (
                  <div className={'order-1 lg:order-2'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[500px]'}
                      width={600}
                      height={500}
                      src={durabilityBlock.image.filename}
                      alt={durabilityBlock.image.alt || durabilityBlock.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {productBlock && <StoryblokComponent blok={productBlock} key={productBlock._uid} />}

        {silverBlock && (
          <div className={'my-2 bg-white pt-20 md:my-10 md:pt-16'}>
            <div className={'relative bg-alabaster pt-48 lg:hidden'}>
              <div
                className={
                  'absolute -top-12 left-1/2 flex w-[calc(100%-2rem)] -translate-x-1/2 transform justify-center'
                }
              >
                <Image
                  className={'h-[280px] w-[350px] object-cover'}
                  width={350}
                  height={280}
                  src={silverBlock.image?.filename || ''}
                  alt={silverBlock.image?.alt || silverBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mt-2 text-2xl font-light  md:text-4xl'}>{silverBlock.title}</h3>
                <p className={'mb-8 text-sm font-light leading-relaxed md:text-lg'}>{silverBlock.description}</p>
                <div className={'mx-auto flex w-fit flex-col gap-4'}>
                  <Button asChild className={'bg-gray-900 py-4 uppercase'} size={'xl'}>
                    <Link href={silverBlock.slug || ''}>{t('common.read-more-about-silver')}</Link>
                  </Button>
                  <Button asChild className={'bg-creme  py-4 uppercase text-black'} size={'xl'}>
                    <Link href={'/faq/materials'}>{t('common.all-materials')}</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-4 lg:flex'
              }
            >
              <div className={'flex w-full max-w-lg flex-col'}>
                <h3 className={'mb-4 text-5xl font-light'}>{silverBlock.title}</h3>
                <p className={'mb-6 font-light'}>{silverBlock.description}</p>
                <div className={'flex gap-4'}>
                  <Button asChild className={'bg-gray-900 py-4 uppercase'} size={'xl'}>
                    <Link href={silverBlock.slug || ''}>{t('common.read-more-about-silver')}</Link>
                  </Button>
                  <Button asChild className={'bg-creme  py-4 uppercase text-black'} size={'xl'}>
                    <Link href={'/faq/materials'}>{t('common.all-materials')}</Link>
                  </Button>
                </div>
              </div>
              <Image
                className={'absolute -right-56 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={silverBlock.image?.filename || ''}
                alt={silverBlock.image?.alt || silverBlock.title}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwedishYellowGoldPage;
