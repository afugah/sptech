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
  _uid?: string;
}

interface FaqPageProps {
  locale: string;
  story?: StoryblokStory<CmsPage>;
}

const FaqPage: React.FC<FaqPageProps> = ({ story }) => {
  const t = useTranslations();

  const getFaqUrl = (title: string): string => {
    switch (title) {
      case 'Return & Exchange':
        return '/faq/returns';
      case 'Size guides':
        return '/faq/size-guides';
      default: {
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
        if (title.includes('STONES') || title.includes('Stones')) {
          return '/faq/stones';
        }
        if (title.includes('MATERIALS') || title.includes('materials')) {
          return '/faq/materials';
        }
        return `/faq/${slug}`;
      }
    }
  };

  return (
    <div className={''}>
      <PageHeader component={'config'} hasHeaderFixed={false} />
      <div className={'pt-40 sm:pt-44 lg:pt-48'}>
        <div className={'relative mb-6 mt-8 text-center sm:mb-8 sm:mt-10 lg:mb-8 lg:mt-6'}>
          <h1
            aria-hidden={'true'}
            className={
              'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase tracking-widest text-black sm:text-md lg:text-lg'
            }
          >
            {t('metadata.faq')}
          </h1>
          <h2 className={'text-center text-6xl uppercase text-creme sm:text-8xl lg:text-9xl xl:text-[120px]'}>
            {t('menu.faq')}
          </h2>
        </div>
      </div>
      <Breadcrumbs
        className={'mb-10 flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest'}
      >
        <li>
          <a href={'/'} className={'uppercase hover:underline'}>
            {t('common.home')}
          </a>
        </li>
        <li className={'text-xxs'}>{t('menu.faq')}</li>
      </Breadcrumbs>

      {story?.content?.blocks && (
        <div className={'mt-28'}>
          {(story.content.blocks as FaqBlock[])
            .filter((block: FaqBlock) => block.title === 'Return & Exchange')
            .map((block: FaqBlock, index: number) => (
              <div key={block._uid || index} className={'mb-16 '}>
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
                    <h3 className={'mb-6 text-4xl font-light tracking-wider'}>{block.title}</h3>
                    <p className={'mb-8 text-lg font-light leading-relaxed'}>{block.description}</p>
                    <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase tracking-wider'} size={'xl'}>
                      <Link href={getFaqUrl(block.title)}>{t('common.read-more')}</Link>
                    </Button>
                  </div>
                </div>

                <div
                  className={
                    'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-16 lg:flex'
                  }
                >
                  <div className={'flex w-full max-w-lg flex-col'}>
                    <h3 className={'mb-4 text-5xl font-light tracking-wider'}>{block.title}</h3>
                    <p className={'mb-6 font-light'}>{block.description}</p>
                    <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                      <Link href={getFaqUrl(block.title)}>{t('common.read-more')}</Link>
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

          <div className={'mx-4 mt-20 grid grid-cols-1 gap-8 gap-y-40 lg:grid-cols-2'}>
            {(story.content.blocks as FaqBlock[])
              .filter((block: FaqBlock) => block.title !== 'Return & Exchange' && block.title !== 'Size guides')
              .map((block: FaqBlock, index: number) => (
                <div key={block._uid || index} className={'relative'}>
                  <Image
                    className={'h-[500px] w-full object-cover'}
                    height={500}
                    width={600}
                    src={block.image?.filename || ''}
                    alt={block.image?.alt || block.title}
                  />
                  <div className={'absolute -bottom-20 left-1/2 w-11/12 -translate-x-1/2 bg-backgroundAlternative p-4'}>
                    <h3 className={'mb-4 text-center text-2xl font-light uppercase'}>{block.title}</h3>
                    <div className={'flex justify-center'}>
                      <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                        <Link href={getFaqUrl(block.title)}>{t('common.read-more')}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {(story.content.blocks as FaqBlock[])
            .filter((block: FaqBlock) => block.title === 'Size guides')
            .map((block: FaqBlock, index: number) => (
              <div key={block._uid || index} className={'mb-28 mt-40 max-lg:mb-32 max-lg:mt-60'}>
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
                    <h3 className={'mb-6 text-4xl font-light tracking-wider'}>{block.title}</h3>
                    <p className={'mb-8 text-lg font-light leading-relaxed'}>{block.description}</p>
                    <Button asChild className={'bg-gray-900 px-8 py-4 text-sm uppercase tracking-wider'} size={'xl'}>
                      <Link href={getFaqUrl(block.title)}>{t('common.read-more')}</Link>
                    </Button>
                  </div>
                </div>

                <div
                  className={
                    'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-16 lg:flex'
                  }
                >
                  <div className={'flex w-full max-w-lg flex-col'}>
                    <h3 className={'mb-4 text-5xl font-light tracking-wider'}>{block.title}</h3>
                    <p className={'mb-6 font-light'}>{block.description}</p>
                    <Button asChild className={'w-48 bg-gray-900 py-4'} size={'xl'}>
                      <Link href={getFaqUrl(block.title)}>{t('common.read-more')}</Link>
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
        </div>
      )}
    </div>
  );
};

export default FaqPage;
