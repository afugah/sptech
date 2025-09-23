'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn/button';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { Link } from '@/src/i18n/navigation';
import { type StoryblokStory } from '@/src/lib/storyblok/fetchStoryBlokStory';
import { type CmsPage } from '@/src/types/framework/storyblok-components';

interface FaqBlockImage {
  filename: string;
  alt?: string;
}

interface FaqBlock {
  title: string;
  description?: string;
  image?: FaqBlockImage;
  component?: string;
  slug?: string;
  _uid?: string;
}

interface MaterialsPageProps {
  story?: StoryblokStory<CmsPage>;
}

const MaterialsPage: React.FC<MaterialsPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const description = story.content.description;

  const getMaterialsUrl = (slug: string): string => {
    return `/faq/materials/${slug}`;
  };

  const silverBlock = blocks.find((block) => block.slug === 'silver');
  const goldGridSlugs = ['white-gold', 'swedish-yellow-gold'];
  const goldGridBlocks = blocks.filter((block) => goldGridSlugs.includes(block.slug || ''));
  const fairtradeGoldBlock = blocks.find((block) => block.slug === 'fairtrade-gold');

  return (
    <div className={''}>
      <PageHeader component={'config'} hasHeaderFixed={false} />
      <div className={'pt-28 lg:pt-48'}>
        <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
          <h1
            aria-hidden={'true'}
            className={
              'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black sm:text-sm lg:text-lg'
            }
          >
            {t('faq.materials')}
          </h1>
          <h2 className={'text-center text-9xl font-light uppercase text-creme md:text-[120px]'}>{t('menu.faq')}</h2>
        </div>
        <p className={'mx-auto mb-10 max-w-sm text-center text-lg font-light leading-7 md:max-w-3xl'}>
          {description as string}
        </p>
      </div>
      <Breadcrumbs className={'mb-10 flex items-center justify-center text-center text-sm font-bold uppercase'}>
        <li>
          <a href={'/'} className={'uppercase hover:underline'}>
            {t('common.home')}
          </a>
        </li>
        <li className={'text-xxs'}>{t('faq.materials')}</li>
      </Breadcrumbs>

      <div className={'mt-28'}>
        {silverBlock && (
          <div className={'mb-16 md:mb-32'}>
            <div className={'relative bg-alabaster pt-72 lg:hidden'}>
              <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                <Image
                  className={'h-full w-full object-cover'}
                  fill
                  src={silverBlock.image?.filename || ''}
                  alt={silverBlock.image?.alt || silverBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mb-6 text-4xl font-light'}>{silverBlock.title}</h3>
                <p className={'mb-8 text-lg font-light leading-relaxed'}>{silverBlock.description}</p>
                <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase'} size={'xl'}>
                  <Link href={getMaterialsUrl(silverBlock.slug || '')}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-end bg-alabaster px-16 md:mx-64 lg:flex'
              }
            >
              <Image
                className={'absolute -left-36 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={silverBlock.image?.filename || ''}
                alt={silverBlock.image?.alt || silverBlock.title}
              />
              <div className={'flex w-full max-w-xl flex-col font-bold'}>
                <h3 className={'mb-4 text-5xl font-light tracking-tight'}>{silverBlock.title}</h3>
                <p className={'mb-6 font-light'}>{silverBlock.description}</p>
                <Button asChild className={'w-48 bg-gray-900 py-4 uppercase'} size={'xl'}>
                  <Link href={getMaterialsUrl(silverBlock.slug || '')}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {goldGridBlocks.length > 0 && (
          <div className={'mx-4 mb-80 grid grid-cols-1 gap-8 gap-y-60 md:mb-72 lg:grid-cols-2'}>
            {goldGridBlocks.map((block: FaqBlock, index: number) => (
              <div key={block._uid || index} className={'relative'}>
                <Image
                  className={'h-[500px] w-full object-cover'}
                  height={500}
                  width={600}
                  src={block.image?.filename || ''}
                  alt={block.image?.alt || block.title}
                />
                <div className={'absolute -bottom-48 left-1/2 w-11/12 -translate-x-1/2 bg-creme p-6'}>
                  <h3 className={'mb-4 text-center text-2xl font-light uppercase'}>{block.title}</h3>
                  <p className={'mb-4 text-center font-light'}>{block.description}</p>
                  <div className={'flex justify-center'}>
                    <Button asChild className={'w-48 bg-gray-900 py-4 uppercase'} size={'xl'}>
                      <Link href={getMaterialsUrl(block.slug || '')}>{t('common.read-more')}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {fairtradeGoldBlock && (
          <div className={'mb-28 mt-72 max-lg:mb-32 max-lg:mt-96'}>
            <div className={'relative bg-alabaster pt-72 lg:hidden'}>
              <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                <Image
                  className={'h-full w-full object-cover'}
                  fill
                  src={fairtradeGoldBlock.image?.filename || ''}
                  alt={fairtradeGoldBlock.image?.alt || fairtradeGoldBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mb-6 text-4xl font-light'}>{fairtradeGoldBlock.title}</h3>
                <p className={'mb-8 text-lg font-light leading-relaxed'}>{fairtradeGoldBlock.description}</p>
                <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase'} size={'xl'}>
                  <Link href={getMaterialsUrl(fairtradeGoldBlock.slug || '')}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-end bg-alabaster px-16 md:mx-64 lg:flex'
              }
            >
              <Image
                className={'absolute -left-36 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={fairtradeGoldBlock.image?.filename || ''}
                alt={fairtradeGoldBlock.image?.alt || fairtradeGoldBlock.title}
              />
              <div className={'flex w-full max-w-xl flex-col font-bold'}>
                <div className={'mb-3'}>
                  <span className={'px-1 uppercase'}>CSR</span>
                </div>
                <h3 className={'mb-4 text-5xl font-light tracking-tight'}>{fairtradeGoldBlock.title}</h3>
                <p className={'mb-6 font-light'}>{fairtradeGoldBlock.description}</p>
                <Button asChild className={'w-48 bg-gray-900 py-4 uppercase'} size={'xl'}>
                  <Link href={getMaterialsUrl(fairtradeGoldBlock.slug || '')}>{t('common.full-story')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
