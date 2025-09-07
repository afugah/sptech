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

interface ClarityPageProps {
  story?: StoryblokStory<CmsPage>;
}

const ClarityPage: React.FC<ClarityPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const diamondClarityExplainedBlock = blocks.find((block) => block.slug === 'introduction');
  const clarityGradingScaleBlock = blocks.find((block) => block.slug === 'clarity-grading');
  const clarityScaleBlock = blocks.find((block) => block.slug === 'clarity-scale');

  const caratBlock = blocks.find((block) => block.slug === 'carat');
  const cutBlock = blocks.find((block) => block.slug === 'cut');
  const colourBlock = blocks.find((block) => block.slug === 'colour');
  const footerBlock = blocks.find((block) => block.slug === 'footer-banner');

  const carouselBlocks = [caratBlock, cutBlock, colourBlock].filter(Boolean) as FaqBlock[];

  return (
    <div className={'min-h-screen bg-seashell'}>
      <div className={'bg-creme pb-8 md:pb-44'}>
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
        {diamondClarityExplainedBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-40'}>
            {diamondClarityExplainedBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={diamondClarityExplainedBlock.image.filename}
                  alt={diamondClarityExplainedBlock.image.alt || diamondClarityExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-40 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondClarityExplainedBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondClarityExplainedBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondClarityExplainedBlock.paragraph2}
                  </p>
                </div>
              </div>
              {diamondClarityExplainedBlock.image && (
                <div className={'absolute bottom-12 right-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={diamondClarityExplainedBlock.image.filename}
                    alt={diamondClarityExplainedBlock.image.alt || diamondClarityExplainedBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {(bannerImage as StoryblokImage)?.filename && (
          <div className={''}>
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

        {clarityGradingScaleBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-16 md:pt-0'}>
            {clarityGradingScaleBlock.image && (
              <div className={'absolute -top-10 left-1/2 block w-11/12 -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={clarityGradingScaleBlock.image.filename}
                  alt={clarityGradingScaleBlock.image.alt || clarityGradingScaleBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-40 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-xl'}>
                  <h3 className={'mb-6 text-3xl font-light tracking-wider md:text-4xl lg:text-5xl'}>
                    {clarityGradingScaleBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {clarityGradingScaleBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {clarityGradingScaleBlock.paragraph1}
                  </p>
                </div>
              </div>
              {clarityGradingScaleBlock.image && (
                <div className={'absolute -bottom-10 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={clarityGradingScaleBlock.image.filename}
                    alt={clarityGradingScaleBlock.image.alt || clarityGradingScaleBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {clarityScaleBlock && (
          <div className={'bg-seashell px-4 py-8 md:px-28 md:py-44'}>
            <div className={'mx-auto max-w-6xl'}>
              <h3 className={'mb-4 text-left text-3xl font-light tracking-wider md:mb-12 md:text-4xl lg:text-5xl'}>
                {clarityScaleBlock.title}
              </h3>
              <div className={'grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16'}>
                <div className={'text-sm font-light leading-relaxed md:text-base'}>
                  {clarityScaleBlock.paragraph3 &&
                    renderRichContent(clarityScaleBlock.paragraph3, richContentPresets.clarity)}
                </div>
                <div className={'text-sm font-light leading-relaxed md:text-base'}>
                  {clarityScaleBlock.paragraph4 &&
                    renderRichContent(clarityScaleBlock.paragraph4, richContentPresets.clarity)}
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
                  ENAGAGEMENT RINGS
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

export default ClarityPage;
