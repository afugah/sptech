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

interface FairtradeGoldPageProps {
  story?: StoryblokStory<CmsPage>;
}

const FairtradeGoldPage: React.FC<FairtradeGoldPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage } = story.content;

  const introductionBlock = blocks.find((block) => block.slug === 'introduction');
  const materialsFactsBlock = blocks.find((block) => block.slug === 'materials-facts');

  return (
    <div className={'min-h-screen bg-sage-300'}>
      <div className={'bg-sage pb-8 md:pb-44'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          <p className={'mx-auto max-w-xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
            {isValidStringNode(description) ? description : ''}
          </p>
          <Breadcrumbs
            className={
              'mb-6 flex flex-wrap items-center justify-center text-center text-xs font-bold uppercase tracking-widest md:mb-10'
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
          <div className={'relative pb-8 md:px-24 md:pb-16 md:pt-20'}>
            {introductionBlock.image && (
              <div className={'absolute -top-10 left-1/2 mx-auto block w-11/12 max-w-md -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={introductionBlock.image.filename}
                  alt={introductionBlock.image.alt || introductionBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 text-center md:px-0 md:text-left'}>
                <div className={'mx-auto max-w-xl lg:ml-0 lg:mr-auto'}>
                  <h6 className={'font-sans text-sm'}>{introductionBlock.title}</h6>

                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {introductionBlock.paragraph1}
                  </p>
                  {introductionBlock.paragraph3 &&
                    renderRichContent(introductionBlock.paragraph3, richContentPresets.csr)}
                </div>
              </div>
              <div className={'flex-1'}>
                {introductionBlock.image && (
                  <div className={'absolute -top-16 right-10 hidden lg:block'}>
                    <Image
                      className={'h-[750px] w-[600px] object-cover'}
                      width={600}
                      height={750}
                      src={introductionBlock.image.filename}
                      alt={introductionBlock.image.alt || introductionBlock.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(bannerImage as { filename?: string })?.filename && (
          <div className={''}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[600px]'}
                width={1200}
                height={400}
                src={safeString((bannerImage as { filename?: string })?.filename)}
                alt={
                  safeString((bannerImage as { alt?: string })?.alt) ||
                  safeString((bannerImage as { filename?: string })?.filename)
                }
              />
            </div>
          </div>
        )}

        {materialsFactsBlock && (
          <div className={'bg-white pb-28 max-lg:mt-40 md:pt-10'}>
            <div className={'relative pt-72 lg:hidden'}>
              <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                <Image
                  className={'h-full w-full object-cover'}
                  fill
                  src={materialsFactsBlock.image?.filename || ''}
                  alt={materialsFactsBlock.image?.alt || materialsFactsBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mb-6 text-4xl font-light tracking-wider'}>{materialsFactsBlock.title}</h3>
                <p className={'mb-8 text-lg font-light leading-relaxed'}>{materialsFactsBlock.description}</p>
                <Button asChild className={'bg-creme px-8 py-4 text-sm uppercase tracking-wider'} size={'xl'}>
                  <Link href={materialsFactsBlock.title}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-16 lg:flex'
              }
            >
              <div className={'flex w-full max-w-lg flex-col'}>
                <h3 className={'mb-4 text-5xl font-light tracking-wider'}>{materialsFactsBlock.title}</h3>
                <p className={'mb-6 font-light'}>{materialsFactsBlock.description}</p>
                <Button asChild className={'w-48 bg-gray-900 py-4 uppercase text-gray-200'} size={'xl'}>
                  <Link href={materialsFactsBlock.title}>{t('common.read-more')}</Link>
                </Button>
              </div>
              <Image
                className={'absolute -right-36 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={materialsFactsBlock.image?.filename || ''}
                alt={materialsFactsBlock.image?.alt || materialsFactsBlock.title}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FairtradeGoldPage;
