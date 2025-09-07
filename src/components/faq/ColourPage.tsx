'use client';

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
  paragraph3?: StoryblokRichtext;
  paragraph4?: StoryblokRichtext;
  image?: FaqBlockImage;
  component?: string;
  slug?: string;
  _uid?: string;
}

interface ColourPageProps {
  story?: StoryblokStory<CmsPage>;
}

const ColourPage: React.FC<ColourPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const diamondColourExplainedBlock = blocks.find((block) => block.slug === 'introduction');
  const diamondColourScaleBlock = blocks.find((block) => block.slug === 'colour-scale');
  const fancyColourDiamondsBlock = blocks.find((block) => block.slug === 'fancy-colour');
  const blackDiamondsBlock = blocks.find((block) => block.slug === 'black-diamonds');

  const caratBlock = blocks.find((block) => block.slug === 'carat');
  const cutBlock = blocks.find((block) => block.slug === 'cut');
  const clarityBlock = blocks.find((block) => block.slug === 'clarity');
  const footerBlock = blocks.find((block) => block.slug === 'footer-banner');

  const carouselBlocks = [caratBlock, cutBlock, clarityBlock].filter(Boolean) as FaqBlock[];

  return (
    <div className={'min-h-screen bg-creme'}>
      <div className={'bg-seashell pb-8 md:pb-44'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
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
        {diamondColourExplainedBlock && (
          <div className={'relative relative bg-creme pb-8 md:px-28 md:pb-72 md:pt-40'}>
            {diamondColourExplainedBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={diamondColourExplainedBlock.image.filename}
                  alt={diamondColourExplainedBlock.image.alt || diamondColourExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondColourExplainedBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondColourExplainedBlock.paragraph1}
                  </p>
                </div>
              </div>
              {diamondColourExplainedBlock.image && (
                <div className={'absolute bottom-12 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={diamondColourExplainedBlock.image.filename}
                    alt={diamondColourExplainedBlock.image.alt || diamondColourExplainedBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {diamondColourScaleBlock && (
          <div className={'bg-creme px-4 py-8 md:px-28 md:py-16'}>
            <div className={'mx-auto max-w-7xl'}>
              <h3 className={'mb-4 text-left text-3xl font-light tracking-wide md:mb-4 md:text-4xl lg:text-5xl'}>
                {diamondColourScaleBlock.title}
              </h3>
              <div className={'grid grid-cols-1 gap-x-12 md:grid-cols-2 '}>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondColourScaleBlock.description}
                  </p>
                  {diamondColourScaleBlock.paragraph3 &&
                    renderRichContent(diamondColourScaleBlock.paragraph3, richContentPresets.faq)}
                </div>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  {diamondColourScaleBlock.paragraph4 &&
                    renderRichContent(diamondColourScaleBlock.paragraph4, richContentPresets.faq)}
                </div>
              </div>
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

        {fancyColourDiamondsBlock && (
          <div className={'bg-creme px-4 py-8 md:px-28 md:py-16'}>
            <div className={'mx-auto max-w-7xl'}>
              <h3 className={'mb-8 text-left text-3xl font-light tracking-wide md:mb-12 md:text-4xl lg:text-5xl'}>
                {fancyColourDiamondsBlock.title}
              </h3>
              <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12'}>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  <p className={'mb-3 leading-relaxed'}>{fancyColourDiamondsBlock.description}</p>
                </div>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  <p className={'mb-3 leading-relaxed'}>{fancyColourDiamondsBlock.paragraph1}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {blackDiamondsBlock && (
          <div className={'bg-creme px-4 py-8 md:px-28 md:py-16'}>
            <div className={'mx-auto max-w-7xl'}>
              <div className={'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16'}>
                {blackDiamondsBlock.image && (
                  <div className={'order-1'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[750px]'}
                      width={600}
                      height={750}
                      src={blackDiamondsBlock.image.filename}
                      alt={blackDiamondsBlock.image.alt || blackDiamondsBlock.title}
                    />
                  </div>
                )}
                <div className={'order-2 flex flex-col justify-center'}>
                  <h3 className={'mb-8 text-left text-3xl font-light tracking-wide md:text-4xl lg:text-5xl'}>
                    {blackDiamondsBlock.title}
                  </h3>
                  <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                    <p className={'mb-4 leading-relaxed'}>{blackDiamondsBlock.description}</p>
                    <p className={'mb-4 leading-relaxed'}>{blackDiamondsBlock.paragraph1}</p>
                  </div>
                </div>
              </div>
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
                  ENGAGEMENT RINGS
                </p>
                <Button
                  asChild
                  className={'rounded-0 w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'}
                  size={'xl'}
                >
                  <Link href={`/collections/engagement-rings`}>SHOP HERE</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColourPage;
