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

interface CutPageProps {
  story?: StoryblokStory<CmsPage>;
}

const CutPage: React.FC<CutPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const diamondCutExplainedBlock = blocks.find((block) => block.slug === 'introduction');
  const brilliantCutBlock = blocks.find((block) => block.slug === 'brilliant-cut');
  const princessCutBlock = blocks.find((block) => block.slug === 'princess-cut');
  const baguetteCutBlock = blocks.find((block) => block.slug === 'baguette-cut');
  const emeraldCutBlock = blocks.find((block) => block.slug === 'emerald-cut');
  const cutQualityBlock = blocks.find((block) => block.slug === 'cut-quality');

  const caratBlock = blocks.find((block) => block.slug === 'carat');
  const colourBlock = blocks.find((block) => block.slug === 'colour');
  const clarityBlock = blocks.find((block) => block.slug === 'clarity');
  const footerBlock = blocks.find((block) => block.slug === 'footer-banner');

  const carouselBlocks = [caratBlock, colourBlock, clarityBlock].filter(Boolean) as FaqBlock[];

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
        {diamondCutExplainedBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-72 md:pt-0'}>
            {diamondCutExplainedBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={diamondCutExplainedBlock.image.filename}
                  alt={diamondCutExplainedBlock.image.alt || diamondCutExplainedBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] md:pt-28  lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondCutExplainedBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {diamondCutExplainedBlock.paragraph1}
                  </p>
                </div>
              </div>
              {diamondCutExplainedBlock.image && (
                <div className={'absolute bottom-12 right-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={diamondCutExplainedBlock.image.filename}
                    alt={diamondCutExplainedBlock.image.alt || diamondCutExplainedBlock.title}
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

        {brilliantCutBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-72 md:pt-40'}>
            {brilliantCutBlock.image && (
              <div className={'absolute -top-10 left-1/2 block w-11/12 -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={brilliantCutBlock.image.filename}
                  alt={brilliantCutBlock.image.alt || brilliantCutBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{brilliantCutBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantCutBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantCutBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantCutBlock.paragraph2}
                  </p>
                </div>
              </div>
              {brilliantCutBlock.image && (
                <div className={'absolute -top-14 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={brilliantCutBlock.image.filename}
                    alt={brilliantCutBlock.image.alt || brilliantCutBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {princessCutBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-32 md:pt-0'}>
            {princessCutBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={princessCutBlock.image.filename}
                  alt={princessCutBlock.image.alt || princessCutBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] md:pt-28 lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{princessCutBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {princessCutBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {princessCutBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {princessCutBlock.paragraph2}
                  </p>
                </div>
              </div>
              {princessCutBlock.image && (
                <div className={'absolute bottom-12 right-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={princessCutBlock.image.filename}
                    alt={princessCutBlock.image.alt || princessCutBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {baguetteCutBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-32 md:pt-8'}>
            {baguetteCutBlock.image && (
              <div className={'absolute -top-10 left-1/2 block w-11/12 -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={baguetteCutBlock.image.filename}
                  alt={baguetteCutBlock.image.alt || baguetteCutBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] lg:flex-row lg:items-center lg:gap-16 lg:pt-48'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{baguetteCutBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {baguetteCutBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {baguetteCutBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {baguetteCutBlock.paragraph2}
                  </p>
                </div>
              </div>
              {baguetteCutBlock.image && (
                <div className={'absolute bottom-12 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={baguetteCutBlock.image.filename}
                    alt={baguetteCutBlock.image.alt || baguetteCutBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {emeraldCutBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-32 md:pt-20'}>
            {emeraldCutBlock.image && (
              <div className={'absolute -top-10 mx-4 mb-6 block lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={emeraldCutBlock.image.filename}
                  alt={emeraldCutBlock.image.alt || emeraldCutBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] md:pt-32 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{emeraldCutBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {emeraldCutBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {emeraldCutBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {emeraldCutBlock.paragraph2}
                  </p>
                </div>
              </div>
              {emeraldCutBlock.image && (
                <div className={'absolute -bottom-8 right-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={emeraldCutBlock.image.filename}
                    alt={emeraldCutBlock.image.alt || emeraldCutBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {cutQualityBlock && (
          <div className={'bg-seashell px-4 py-8 md:px-28 md:py-16'}>
            <div className={'mx-auto max-w-7xl'}>
              <h3 className={'mb-8 text-left text-3xl font-light tracking-wide md:mb-12 md:text-4xl lg:text-5xl'}>
                {cutQualityBlock.title}
              </h3>
              <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12'}>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  {cutQualityBlock.paragraph3 && renderRichContent(cutQualityBlock.paragraph3, richContentPresets.faq)}
                </div>
                <div className={'text-sm font-light leading-relaxed text-gray-900 md:text-base'}>
                  {cutQualityBlock.paragraph4 && renderRichContent(cutQualityBlock.paragraph4, richContentPresets.faq)}
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

export default CutPage;
