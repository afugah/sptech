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

interface WhiteGoldPageProps {
  story?: StoryblokStory<CmsPage>;
}

const WhiteGoldPage: React.FC<WhiteGoldPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const whiteGoldExplainedBlock = blocks.find((block) => block.slug === 'introduction');
  const onlyPreciousMetalsBlock = blocks.find((block) => block.slug === 'precious-metals');
  const rhodiumPlatingBlock = blocks.find((block) => block.slug === 'rhodium-plating');
  const careInstructionsBlock = blocks.find((block) => block.slug === 'care-instructions');

  const yellowGoldBlock = blocks.find((block) => block.slug === 'swedish-yellow-gold');
  const productBlock = blocks.find((block) => block.slug === 'products');

  return (
    <div className={'min-h-screen  bg-porcelain'}>
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
        {whiteGoldExplainedBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-20 md:pt-20'}>
            {whiteGoldExplainedBlock.image && (
              <div
                className={
                  'absolute -top-12 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={whiteGoldExplainedBlock.image.filename}
                  alt={whiteGoldExplainedBlock.image.alt || whiteGoldExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-96 md:pt-24 lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {whiteGoldExplainedBlock.description}
                  </p>
                  {whiteGoldExplainedBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {whiteGoldExplainedBlock.paragraph1}
                    </p>
                  )}
                  {whiteGoldExplainedBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {whiteGoldExplainedBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
              {whiteGoldExplainedBlock.image && (
                <div className={'absolute -top-16 right-4 hidden lg:block xl:right-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={whiteGoldExplainedBlock.image.filename}
                    alt={whiteGoldExplainedBlock.image.alt || whiteGoldExplainedBlock.title}
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
                className={'w-full object-cover lg:h-[600px]'}
                width={1200}
                height={600}
                src={(bannerImage as StoryblokImage)?.filename || ''}
                alt={(bannerImage as StoryblokImage)?.alt || 'Banner'}
              />
            </div>
          </div>
        )}

        {onlyPreciousMetalsBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-40 md:pt-20'}>
            {onlyPreciousMetalsBlock.image && (
              <div
                className={
                  'absolute -top-24 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={onlyPreciousMetalsBlock.image.filename}
                  alt={onlyPreciousMetalsBlock.image.alt || onlyPreciousMetalsBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-80 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>
                    {onlyPreciousMetalsBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {onlyPreciousMetalsBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {onlyPreciousMetalsBlock.paragraph1}
                  </p>
                  {onlyPreciousMetalsBlock.paragraph3 &&
                    renderRichContent(onlyPreciousMetalsBlock.paragraph3, richContentPresets.faq)}
                </div>
              </div>
              {onlyPreciousMetalsBlock.image && (
                <div className={'absolute bottom-10 left-4 hidden lg:block xl:left-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={onlyPreciousMetalsBlock.image.filename}
                    alt={onlyPreciousMetalsBlock.image.alt || onlyPreciousMetalsBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {rhodiumPlatingBlock && (
          <div className={'md:py-24'}>
            <div className={'mx-auto px-4 md:px-12'}>
              <div className={'grid grid-cols-1 gap-12 md:ml-20 lg:grid-cols-2 lg:gap-16'}>
                <div className={'order-2 flex flex-col justify-center lg:order-1'}>
                  <h3 className={'mb-6 text-3xl font-light md:text-5xl'}>{rhodiumPlatingBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {rhodiumPlatingBlock.description}
                  </p>
                  {rhodiumPlatingBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {rhodiumPlatingBlock.paragraph1}
                    </p>
                  )}
                  {rhodiumPlatingBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {rhodiumPlatingBlock.paragraph2}
                    </p>
                  )}
                </div>
                {rhodiumPlatingBlock.image && (
                  <div className={'order-1 lg:order-2'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[500px]'}
                      width={600}
                      height={500}
                      src={rhodiumPlatingBlock.image.filename}
                      alt={rhodiumPlatingBlock.image.alt || rhodiumPlatingBlock.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {careInstructionsBlock && (
          <div className={'md:py-24'}>
            <div className={'mx-auto px-4 md:px-12'}>
              <div className={'grid grid-cols-1 gap-12 md:mr-20 lg:grid-cols-2 lg:gap-16'}>
                {careInstructionsBlock.image && (
                  <div className={'order-1 lg:order-1'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[500px]'}
                      width={600}
                      height={500}
                      src={careInstructionsBlock.image.filename}
                      alt={careInstructionsBlock.image.alt || careInstructionsBlock.title}
                    />
                  </div>
                )}
                <div className={'order-2 flex flex-col justify-center lg:order-2'}>
                  <h3 className={'mb-6 text-3xl font-light md:text-5xl'}>{careInstructionsBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {careInstructionsBlock.description}
                  </p>
                  {careInstructionsBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {careInstructionsBlock.paragraph1}
                    </p>
                  )}
                  {careInstructionsBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {careInstructionsBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {productBlock && <StoryblokComponent blok={productBlock} key={productBlock._uid} />}

        {yellowGoldBlock && (
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
                  src={yellowGoldBlock.image?.filename || ''}
                  alt={yellowGoldBlock.image?.alt || yellowGoldBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mt-2 text-2xl font-light  md:text-4xl'}>{yellowGoldBlock.title}</h3>
                <p className={'mb-8 text-sm font-light leading-relaxed md:text-lg'}>{yellowGoldBlock.description}</p>
                <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase'} size={'xl'}>
                  <Link href={yellowGoldBlock.slug || ''}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-4 lg:flex'
              }
            >
              <div className={'flex w-full max-w-lg flex-col'}>
                <h3 className={'mb-4 text-5xl font-light'}>{yellowGoldBlock.title}</h3>
                <p className={'mb-6 font-light'}>{yellowGoldBlock.description}</p>
                <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                  <Link href={yellowGoldBlock.slug || ''}>{t('common.read-more')}</Link>
                </Button>
              </div>
              <Image
                className={'absolute -right-36 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={yellowGoldBlock.image?.filename || ''}
                alt={yellowGoldBlock.image?.alt || yellowGoldBlock.title}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteGoldPage;
