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
import { isValidStringNode, safeString } from '@/src/types/framework/storyblok-helpers';
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
  paragraph4?: StoryblokRichtext;
  image?: FaqBlockImage;
  component?: string;
  slug?: string;
  _uid?: string;
}

interface DiamondsPageProps {
  story?: StoryblokStory<CmsPage>;
}

const DiamondsPage: React.FC<DiamondsPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage, bannerImage2 } = story.content;

  const introductionBlock = blocks.find((block) => block.slug === 'treasures-from-mother-earth');
  const brilliantDiamondsBlock = blocks.find((block) => block.slug === 'conflict-free-diamonds');
  const diamondGuideContent = blocks.filter(
    (block) => block.slug === 'the-4-cs' || block.slug === 'colour-and-clarity',
  );
  const learnMoreBlock = blocks.find((block) => block.slug === 'learn-more');
  const cutAndCaratContentBlock = blocks.filter(
    (block) => block.slug === 'cut-and-carat' || block.slug === 'biggest-is-not-always-the-largest',
  );
  const longVersionBlock = blocks.find((block) => block.slug === 'long-version');
  const realDiamondsBlock = blocks.find((block) => block.slug === 'real-diamonds');
  const footerBlock = blocks.find((block) => block.slug === 'footer-banner');

  return (
    <div className={'min-h-screen bg-alabaster'}>
      <div className={'bg-creme-200 pb-8 md:pb-44'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
            {isValidStringNode(description) ? description : ''}
          </p>
          <Breadcrumbs
            className={
              'mb-6 flex items-center justify-center text-center text-xs font-bold uppercase md:mb-10 md:tracking-widest'
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
        {introductionBlock && (
          <div className={'relative relative pb-8 md:px-24 md:pb-16 md:pt-40'}>
            {introductionBlock.image && (
              <div className={'absolute -top-10 left-1/2 mx-auto block w-11/12 max-w-md -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={safeString((introductionBlock.image as { filename?: string })?.filename)}
                  alt={
                    safeString((introductionBlock.image as { alt?: string })?.alt) ||
                    safeString(introductionBlock.title)
                  }
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'lg:flex-1'}></div>
              <div className={'flex-1 px-4 text-center md:px-0 md:text-left lg:order-2'}>
                <div className={'mx-auto max-w-xl lg:mx-0'}>
                  <h3 className={'mb-8 text-3xl font-light md:text-5xl'}>{introductionBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.paragraph2}
                  </p>
                </div>
              </div>
              {introductionBlock.image && (
                <div className={'absolute -top-16 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={safeString((introductionBlock.image as { filename?: string })?.filename)}
                    alt={
                      safeString((introductionBlock.image as { alt?: string })?.alt) ||
                      safeString(introductionBlock.title)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {(bannerImage as { filename?: string })?.filename && (
          <div className={''}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[500px]'}
                width={1200}
                height={400}
                src={safeString((bannerImage as { filename?: string })?.filename)}
                alt={safeString((bannerImage as { alt?: string })?.alt) || 'Banner'}
              />
            </div>
          </div>
        )}

        {brilliantDiamondsBlock && (
          <div className={'relative relative bg-seashell pb-8 md:px-28 md:pb-72 md:pt-40'}>
            {brilliantDiamondsBlock.image && (
              <div className={'absolute -top-10 left-1/2 block w-11/12 -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  width={400}
                  height={500}
                  src={brilliantDiamondsBlock.image.filename}
                  alt={brilliantDiamondsBlock.image.alt || brilliantDiamondsBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-[480px] md:pt-0 lg:flex-row lg:items-center lg:gap-32 '}>
              <div className={'lg:flex-1'}></div>
              <div className={'flex-1 px-4 text-center md:px-0 md:text-left lg:order-2'}>
                <div className={'mx-auto max-w-lg lg:mx-0'}>
                  <h3 className={'mb-6 text-2xl font-light md:text-4xl lg:text-5xl'}>{brilliantDiamondsBlock.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantDiamondsBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantDiamondsBlock.paragraph1}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {brilliantDiamondsBlock.paragraph2}
                  </p>
                </div>
              </div>
              {brilliantDiamondsBlock.image && (
                <div className={'absolute -top-14 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={brilliantDiamondsBlock.image.filename}
                    alt={brilliantDiamondsBlock.image.alt || brilliantDiamondsBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {diamondGuideContent.length > 0 && (
          <div className={'px-4 py-10 md:px-32 md:py-20'}>
            <div className={'flex flex-col gap-12 md:flex-row md:justify-between md:gap-20'}>
              {diamondGuideContent.map((block) => (
                <div key={block._uid} className={'mb-8 text-center md:mb-0 md:text-left'}>
                  <h3 className={'mb-4 text-3xl font-light md:text-4xl'}>{block.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>{block.description}</p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>{block.paragraph1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {learnMoreBlock && (
          <div className={'flex flex-col justify-between px-4 py-10 md:flex-row md:px-24 md:py-20'}>
            {learnMoreBlock.image && (
              <div className={'order-1 mx-auto mb-8 md:order-2 md:mx-0 md:mb-0'}>
                <Image
                  className={
                    'h-[300px] w-full max-w-md object-cover md:h-[400px] md:w-[600px] md:max-w-none lg:h-[500px] lg:w-[700px]'
                  }
                  width={700}
                  height={500}
                  src={learnMoreBlock.image.filename}
                  alt={learnMoreBlock.image.alt || 'Learn More'}
                />
              </div>
            )}
            <div className={'order-2 flex flex-col items-center justify-center md:order-1 md:mb-0 md:items-start'}>
              <h3 className={'mb-6 text-center text-3xl font-light md:text-left md:text-4xl'}>
                {learnMoreBlock.title}
              </h3>
              <div className={'flex flex-col gap-6 md:flex-row'}>
                <Button asChild className={'w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'} size={'xl'}>
                  <Link href={`/faq/stones/colour`}>COLOUR</Link>
                </Button>
                <Button asChild className={'w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'} size={'xl'}>
                  <Link href={`/faq/stones/clarity`}>CLARITY</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {cutAndCaratContentBlock.length > 0 && (
          <div className={'px-4 py-10 md:px-32 md:py-20'}>
            <div className={'flex flex-col gap-12 md:flex-row md:justify-between md:gap-20'}>
              {cutAndCaratContentBlock.map((block) => (
                <div key={block._uid} className={'mb-8 text-center md:mb-0 md:text-left'}>
                  <h3 className={'mb-4 text-3xl font-light md:text-4xl'}>{block.title}</h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>{block.description}</p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>{block.paragraph1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {longVersionBlock && (
          <div className={'flex flex-col justify-between px-4 py-10 md:flex-row md:px-24 md:py-20'}>
            {longVersionBlock.image && (
              <div className={'order-1 mx-auto mb-8 md:order-2 md:mx-0 md:mb-0'}>
                <Image
                  className={
                    'h-[300px] w-full max-w-md object-cover md:h-[400px] md:w-[600px] md:max-w-none lg:h-[500px] lg:w-[700px]'
                  }
                  width={700}
                  height={500}
                  src={longVersionBlock.image.filename}
                  alt={longVersionBlock.image.alt || ''}
                />
              </div>
            )}
            <div className={'order-2 flex flex-col items-center justify-center md:order-1 md:mb-0 md:items-start'}>
              <h3 className={'mb-6 text-center text-3xl font-light md:text-left md:text-4xl'}>
                {longVersionBlock.title}
              </h3>
              <div className={'flex flex-col gap-6 md:flex-row'}>
                <Button asChild className={'w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'} size={'xl'}>
                  <Link href={`/faq/stones/cut`}>CUT</Link>
                </Button>
                <Button asChild className={'w-56 bg-creme font-bold text-gray-900 hover:bg-opacity-90'} size={'xl'}>
                  <Link href={`/faq/stones/carat`}>CARAT</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {(bannerImage2 as { filename?: string })?.filename && (
          <div className={''}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[600px]'}
                width={1200}
                height={400}
                src={safeString((bannerImage2 as { filename?: string })?.filename)}
                alt={safeString((bannerImage2 as { alt?: string })?.alt) || 'Banner'}
              />
            </div>
          </div>
        )}

        {realDiamondsBlock && (
          <div className={'px-4 py-10 md:px-32 md:py-20'}>
            <div className={'mb-8'}>
              <h3 className={'mb-8 text-3xl font-light md:text-4xl'}>{realDiamondsBlock.title}</h3>
            </div>
            <div className={'flex flex-col md:flex-row md:gap-20'}>
              <div className={'mb-8 flex-1 md:mb-0'}>
                <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                  {realDiamondsBlock.description}
                </p>
                {realDiamondsBlock.paragraph3 &&
                  renderRichContent(realDiamondsBlock.paragraph3, richContentPresets.faq)}
              </div>
              <div className={'flex-1'}>
                <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                  {realDiamondsBlock.paragraph1}
                </p>
              </div>
            </div>
          </div>
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
                'absolute inset-0 flex items-end justify-center pb-10 md:items-center md:justify-end md:pb-0 md:pr-4 lg:pr-6'
              }
            >
              <div className={'max-w-sm text-center text-white md:mr-2 md:text-right lg:mr-4'}>
                <p className={'mb-2 font-serif text-2xl font-light text-white md:text-3xl'}>See all of our</p>
                <p
                  className={
                    'mb-6 font-serif text-3xl font-light uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl'
                  }
                >
                  ENGAGEMENT RINGS
                </p>
                <Button asChild className={'w-56 bg-gray-900 font-bold uppercase text-gray-300'} size={'xl'}>
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

export default DiamondsPage;
