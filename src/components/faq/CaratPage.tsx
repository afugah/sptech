'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn/button';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { Link } from '@/src/i18n/navigation';
import { type StoryblokStory } from '@/src/lib/storyblok/fetchStoryBlokStory';
import { type CmsPage } from '@/src/types/framework/storyblok-components';
import { type StoryblokImage } from '@/src/types/framework/storyblok-helpers';
import FaqCarousel from './FaqCarousel';

interface FaqBlockImage {
  filename: string;
  alt?: string;
}

interface FaqBlock {
  title: string;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  image?: FaqBlockImage;
  component?: string;
  slug?: string;
  _uid?: string;
}

interface CaratPageProps {
  story?: StoryblokStory<CmsPage>;
}

const CaratPage: React.FC<CaratPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const diamondCaratExplainedBlock = blocks.find((block) => block.slug === 'diamond-carat-explained');
  const diamondSizeVsCaratMisconceptionBlock = blocks.find(
    (block) => block.slug === 'diamond-size-vs-carat-misconception',
  );
  const diamondSizeVsWeightMythBlock = blocks.find((block) => block.slug === 'diamond-size-vs-weight-myth');

  const cutBlock = blocks.find((block) => block.slug === 'cut');
  const colourBlock = blocks.find((block) => block.slug === 'colour');
  const clarityBlock = blocks.find((block) => block.slug === 'clarity');
  const footerBlock = blocks.find((block) => block.slug === 'footer-banner');

  const carouselBlocks = [cutBlock, colourBlock, clarityBlock].filter(Boolean) as FaqBlock[];

  return (
    <div className={'min-h-screen bg-seashell'}>
      <div className={'bg-creme pb-8 md:pb-44'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-xl text-center text-sm uppercase leading-6 md:text-sm md:leading-8'}>
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
        {diamondCaratExplainedBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-72 md:pt-40'}>
            {diamondCaratExplainedBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={diamondCaratExplainedBlock.image.filename}
                  alt={diamondCaratExplainedBlock.image.alt || diamondCaratExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondCaratExplainedBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondCaratExplainedBlock.paragraph1}
                  </p>
                </div>
              </div>
              {diamondCaratExplainedBlock.image && (
                <div className={'absolute bottom-12 right-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={diamondCaratExplainedBlock.image.filename}
                    alt={diamondCaratExplainedBlock.image.alt || diamondCaratExplainedBlock.title}
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

        {diamondSizeVsCaratMisconceptionBlock && (
          <div className={'py-8 md:py-0'}>
            {diamondSizeVsCaratMisconceptionBlock.image && (
              <div className={'mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={diamondSizeVsCaratMisconceptionBlock.image.filename}
                  alt={diamondSizeVsCaratMisconceptionBlock.image.alt || diamondSizeVsCaratMisconceptionBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col md:mx-12 lg:flex-row lg:items-center lg:gap-16'}>
              {diamondSizeVsCaratMisconceptionBlock.image && (
                <div className={'hidden flex-1 lg:order-1 lg:block'}>
                  <Image
                    className={'h-[400px] w-full object-cover lg:h-[500px]'}
                    width={600}
                    height={500}
                    src={diamondSizeVsCaratMisconceptionBlock.image.filename}
                    alt={diamondSizeVsCaratMisconceptionBlock.image.alt || diamondSizeVsCaratMisconceptionBlock.title}
                  />
                </div>
              )}
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>
                    {diamondSizeVsCaratMisconceptionBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondSizeVsCaratMisconceptionBlock.description}
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                'mx-4 flex flex-col items-center justify-center gap-8 px-4 py-8 md:mx-24 md:flex-row md:gap-16 md:py-60'
              }
            >
              {diamondSizeVsCaratMisconceptionBlock.paragraph1 && (
                <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                  {diamondSizeVsCaratMisconceptionBlock.paragraph1}
                </p>
              )}
              {diamondSizeVsCaratMisconceptionBlock.paragraph2 && (
                <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                  {diamondSizeVsCaratMisconceptionBlock.paragraph2}
                </p>
              )}
            </div>
          </div>
        )}

        {diamondSizeVsWeightMythBlock && (
          <div className={'px-4 pb-8 md:pb-40 md:pl-24 md:pr-12'}>
            {diamondSizeVsWeightMythBlock.image && (
              <div className={'mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={diamondSizeVsWeightMythBlock.image.filename}
                  alt={diamondSizeVsWeightMythBlock.image.alt || diamondSizeVsWeightMythBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-xl'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>
                    {diamondSizeVsWeightMythBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondSizeVsWeightMythBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondSizeVsWeightMythBlock.paragraph1}
                  </p>
                </div>
              </div>
              {diamondSizeVsWeightMythBlock.image && (
                <div className={'hidden flex-1 lg:order-2 lg:block'}>
                  <Image
                    className={'h-[400px] w-full object-cover lg:h-[500px]'}
                    width={600}
                    height={500}
                    src={diamondSizeVsWeightMythBlock.image.filename}
                    alt={diamondSizeVsWeightMythBlock.image.alt || diamondSizeVsWeightMythBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {carouselBlocks.length > 0 && (
          <FaqCarousel
            items={carouselBlocks}
            headerText={t('faq.read-more-about-it-here')}
            backgroundColor={'bg-creme'}
            urlPath={'/faq/stones'}
            buttonText={t('common.full-story')}
          />
        )}

        {footerBlock?.image && (
          <div className={'relative'}>
            <Image
              className={'h-[400px] w-full object-cover lg:h-[600px]'}
              width={1200}
              height={600}
              src={footerBlock.image.filename}
              alt={footerBlock.image.alt || 'Footer Banner'}
            />
            <div
              className={
                'absolute inset-0 flex items-end justify-center pb-10 lg:items-center lg:justify-start lg:pb-0'
              }
            >
              <div className={'max-w-sm text-center text-white lg:ml-4 lg:text-left'}>
                <p className={'mb-2 font-serif text-2xl font-light text-white md:text-3xl'}>See all</p>
                <p
                  className={
                    'mb-6 font-serif text-3xl font-light uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl'
                  }
                >
                  WEDDING RINGS
                </p>
                <Button
                  asChild
                  className={'rounded-0 w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'}
                  size={'xl'}
                >
                  <Link href={`/collections/wedding-rings`}>SHOP HERE</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaratPage;
