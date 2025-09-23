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

interface StonesPageProps {
  story?: StoryblokStory<CmsPage>;
}

const StonesPage: React.FC<StonesPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];

  const getStonesUrl = (slug: string): string => {
    return `/faq/stones/${slug}`;
  };

  const firstGridSlugs = ['carat', 'cut'];
  const secondGridSlugs = ['colour', 'clarity'];
  const lastBlockSlug = 'natural-vs-lab-grown-diamonds';

  const specialSlugs = [...firstGridSlugs, ...secondGridSlugs, lastBlockSlug];

  const firstGridBlocks = blocks.filter((block) => firstGridSlugs.includes(block.slug || ''));

  const secondGridBlocks = blocks.filter((block) => secondGridSlugs.includes(block.slug || ''));

  const lastBlock = blocks.find((block) => block.slug === lastBlockSlug);

  const middleBlocks = blocks.filter((block) => !specialSlugs.includes(block.slug || ''));

  return (
    <div className={''}>
      <PageHeader component={'config'} hasHeaderFixed={false} />
      <div className={'pt-40 sm:pt-44 lg:pt-48'}>
        <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
          <h1
            aria-hidden={'true'}
            className={
              'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black sm:text-sm lg:text-lg'
            }
          >
            {t('faq.stones')}
          </h1>
          <h2
            className={'text-center text-6xl font-light uppercase text-creme sm:text-8xl lg:text-9xl xl:text-[120px]'}
          >
            {t('menu.faq')}
          </h2>
        </div>
      </div>
      <Breadcrumbs className={'mb-10 flex items-center justify-center text-center text-sm font-bold uppercase'}>
        <li>
          <a href={'/'} className={'uppercase hover:underline'}>
            {t('common.home')}
          </a>
        </li>
        <li className={'text-xxs'}>{t('faq.stones')}</li>
      </Breadcrumbs>

      {blocks.length > 0 && (
        <div className={'mt-28'}>
          {firstGridBlocks.length > 0 && (
            <div className={'mx-4 mb-80 grid grid-cols-1 gap-8 gap-y-60 md:mb-72 lg:grid-cols-2'}>
              {firstGridBlocks.map((block: FaqBlock, index: number) => (
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
                      <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                        <Link href={getStonesUrl(block.slug || '')}>{t('common.read-more')}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {middleBlocks.map((block: FaqBlock, index: number) => (
            <div key={block._uid || index} className={'mb-20'}>
              <div className={'relative bg-alabaster pt-72 lg:hidden'}>
                <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                  <Image
                    className={'h-full w-full object-cover'}
                    fill
                    src={block.image?.filename || ''}
                    alt={block.image?.alt || block.title}
                  />
                </div>
                <div className={'px-8 py-12 text-center'}>
                  <h3 className={'mb-6 text-4xl font-light'}>{block.title}</h3>
                  <p className={'mb-8 text-lg font-light leading-relaxed'}>{block.description}</p>
                  <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase'} size={'xl'}>
                    <Link href={getStonesUrl(block.slug || '')}>{t('common.read-more')}</Link>
                  </Button>
                </div>
              </div>

              <div
                className={
                  'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-16 lg:flex'
                }
              >
                <div className={'flex w-full max-w-lg flex-col'}>
                  <h3 className={'mb-4 text-5xl font-light'}>{block.title}</h3>
                  <p className={'mb-6 font-light'}>{block.description}</p>
                  <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                    <Link href={getStonesUrl(block.slug || '')}>{t('common.read-more')}</Link>
                  </Button>
                </div>
                <Image
                  className={'absolute -right-36 h-[470px] w-[600px] object-cover'}
                  height={600}
                  width={600}
                  src={block.image?.filename || ''}
                  alt={block.image?.alt || block.title}
                />
              </div>
            </div>
          ))}

          {secondGridBlocks.length > 0 && (
            <div className={'mx-4 mt-24 grid grid-cols-1 gap-8 gap-y-60 lg:grid-cols-2'}>
              {secondGridBlocks.map((block: FaqBlock, index: number) => (
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
                      <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                        <Link href={getStonesUrl(block.slug || '')}>{t('common.read-more')}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {lastBlock && (
            <div className={'mb-28 mt-72 max-lg:mb-32 max-lg:mt-96'}>
              <div className={'relative bg-alabaster pt-72 lg:hidden'}>
                <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                  <Image
                    className={'h-full w-full object-cover'}
                    fill
                    src={lastBlock.image?.filename || ''}
                    alt={lastBlock.image?.alt || lastBlock.title}
                  />
                </div>
                <div className={'px-8 py-12 text-center'}>
                  <h3 className={'mb-6 text-4xl font-light'}>{lastBlock.title}</h3>
                  <p className={'mb-8 text-lg font-light leading-relaxed'}>{lastBlock.description}</p>
                  <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase'} size={'xl'}>
                    <Link href={getStonesUrl(lastBlock.slug || '')}>{t('common.read-more')}</Link>
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
                  src={lastBlock.image?.filename || ''}
                  alt={lastBlock.image?.alt || lastBlock.title}
                />
                <div className={'flex w-full max-w-xl flex-col font-bold'}>
                  <h3 className={'mb-4 text-5xl font-light tracking-tight'}>{lastBlock.title}</h3>
                  <p className={'mb-6 font-light'}>{lastBlock.description}</p>
                  <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                    <Link href={getStonesUrl(lastBlock.slug || '')}>{t('common.read-more')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StonesPage;
