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
import FaqCarousel from '../faq/FaqCarousel';

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

interface CSRPageProps {
  story?: StoryblokStory<CmsPage>;
}

const CSRPage: React.FC<CSRPageProps> = ({ story }) => {
  const t = useTranslations();

  if (!story) {
    return null;
  }

  const blocks = (story.content.blocks || []) as FaqBlock[];
  const { title, description, bannerImage, bannerImage2 } = story.content;

  const materialBlock = blocks.find((block) => block.slug === 'material');
  const productionBlock = blocks.find((block) => block.slug === 'the-production');
  const kimberlyProcessBlock = blocks.find((block) => block.slug === 'kimberly-process');
  const naturalVsLabGrownDiamondBlock = blocks.find((block) => block.slug === 'natural-and-lab-grown-diamonds');
  const responsibleJewelleryCouncilBlock = blocks.find((block) => block.slug === 'responsible-jewellery-council');
  const organicCottonBlock = blocks.find((block) => block.slug === 'organic-cotton');
  const colourStonesBlock = blocks.find((block) => block.slug === 'colour-stones');
  const perfumesBlock = blocks.find((block) => block.slug === 'perfumes');
  const packagingBlock = blocks.find((block) => block.slug === 'packaging');
  const carouselBlocks = blocks.filter(
    (block) => block.slug === 'fairtrade-gold' || block.slug === 'natural-vs-lab-grown-diamonds',
  );
  const BehindBeautyWithAThoughtBlock = blocks.find((block) => block.slug === 'behind-beauty-with-a-thought');

  return (
    <div className={'min-h-screen bg-sage-300'}>
      <div className={'bg-sage-700 pb-8 md:pb-44'}>
        <PageHeader component={'config'} hasHeaderFixed={false} />
        <div className={'space-y-6 px-4 pb-10 pt-40 sm:pt-44 md:space-y-10 md:pb-0 lg:pt-48'}>
          <p className={'text-center font-serif text-3xl tracking-tight md:text-5xl'}>{title}</p>
          {typeof description === 'string' && description && (
            <p className={'mx-auto max-w-2xl text-center text-xs uppercase leading-6 md:text-sm md:leading-8'}>
              {description}
            </p>
          )}
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
        {materialBlock && (
          <div className={'relative pb-8 md:px-24 md:pb-16 md:pt-28'}>
            {materialBlock.image && (
              <div className={'absolute -top-10 left-1/2 mx-auto block w-11/12 max-w-md -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[300px] w-full object-cover'}
                  width={400}
                  height={300}
                  src={materialBlock.image.filename}
                  alt={materialBlock.image.alt || materialBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-72 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 text-center md:px-0 md:text-left'}>
                <div className={'mx-auto max-w-xl lg:ml-0 lg:mr-auto'}>
                  <h3 className={'mb-6 text-3xl font-light md:text-5xl'}>{materialBlock.title}</h3>
                  <p className={'text-sm leading-6 text-gray-900 md:text-base'}>{materialBlock.description}</p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {materialBlock.paragraph1}
                  </p>
                  {materialBlock.paragraph3 && renderRichContent(materialBlock.paragraph3, richContentPresets.csr)}
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {materialBlock.paragraph2}
                  </p>
                </div>
              </div>
              <div className={'flex-1'}>
                {materialBlock.image && (
                  <div className={'absolute -top-16 right-10 hidden lg:block'}>
                    <Image
                      className={'h-[750px] w-[600px] object-cover'}
                      width={600}
                      height={750}
                      src={materialBlock.image.filename}
                      alt={materialBlock.image.alt || materialBlock.title}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!!(bannerImage as StoryblokImage)?.filename && (
          <div className={''}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[600px]'}
                width={1200}
                height={400}
                src={(bannerImage as StoryblokImage).filename || ''}
                alt={(bannerImage as StoryblokImage).alt || (bannerImage as StoryblokImage).filename || ''}
              />
            </div>
          </div>
        )}

        {productionBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-36 md:pt-28'}>
            {productionBlock.image && (
              <div className={'absolute -top-10 left-1/2 block w-11/12 -translate-x-1/2 lg:hidden'}>
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={productionBlock.image.filename}
                  alt={productionBlock.image.alt || productionBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-96 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'lg:flex-1'}></div>
              <div className={'flex-1 px-4 text-center md:px-0 md:text-left lg:order-2'}>
                <div className={'mx-auto max-w-lg lg:mx-0'}>
                  <h3 className={'mb-6 text-3xl font-light md:text-5xl'}>{productionBlock.title}</h3>
                  {productionBlock.paragraph3 && renderRichContent(productionBlock.paragraph3, richContentPresets.csr)}
                  {productionBlock.paragraph4 && renderRichContent(productionBlock.paragraph4, richContentPresets.csr)}
                </div>
              </div>
              {productionBlock.image && (
                <div className={'absolute -top-14 left-10 hidden lg:block'}>
                  <Image
                    className={'h-[750px] w-[600px] object-cover'}
                    width={600}
                    height={750}
                    src={productionBlock.image.filename}
                    alt={productionBlock.image.alt || productionBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {kimberlyProcessBlock && (
          <div className={'relative mt-12 pb-8 md:mt-0 md:px-28 md:pb-28 md:pt-10'}>
            {kimberlyProcessBlock.image && (
              <div
                className={
                  'absolute -top-12 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={kimberlyProcessBlock.image.filename}
                  alt={kimberlyProcessBlock.image.alt || kimberlyProcessBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-96 md:pt-0 lg:flex-row lg:items-center lg:gap-16'}>
              <div className={'flex-1 px-4 md:px-0 lg:order-1'}>
                <div className={'max-w-lg'}>
                  <p className={'mb-1 text-sm leading-6 text-gray-900 md:text-base'}>{kimberlyProcessBlock.title}</p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {kimberlyProcessBlock.description}
                  </p>
                  {kimberlyProcessBlock.paragraph1 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {kimberlyProcessBlock.paragraph1}
                    </p>
                  )}
                  {kimberlyProcessBlock.paragraph2 && (
                    <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                      {kimberlyProcessBlock.paragraph2}
                    </p>
                  )}
                </div>
              </div>
              {kimberlyProcessBlock.image && (
                <div className={'absolute -top-16 right-4 hidden lg:block xl:right-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={kimberlyProcessBlock.image.filename}
                    alt={kimberlyProcessBlock.image.alt || kimberlyProcessBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {naturalVsLabGrownDiamondBlock && (
          <div className={'md:py-2'}>
            <div className={'mx-auto px-4 md:px-10'}>
              <div className={'grid grid-cols-1 gap-12 md:mr-20 lg:grid-cols-2 lg:gap-56'}>
                {naturalVsLabGrownDiamondBlock.image && (
                  <div className={'order-1 md:w-[650px] lg:order-1'}>
                    <Image
                      className={'h-[400px] w-full object-cover lg:h-[500px]'}
                      width={650}
                      height={500}
                      src={naturalVsLabGrownDiamondBlock.image.filename}
                      alt={naturalVsLabGrownDiamondBlock.image.alt || naturalVsLabGrownDiamondBlock.title}
                    />
                  </div>
                )}
                <div className={'order-2 flex flex-col justify-center lg:order-2'}>
                  <p className={'text-sm leading-6 text-gray-900 md:text-base'}>
                    {naturalVsLabGrownDiamondBlock.title}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {naturalVsLabGrownDiamondBlock.description}
                  </p>
                  {naturalVsLabGrownDiamondBlock.paragraph3 &&
                    renderRichContent(naturalVsLabGrownDiamondBlock.paragraph3, richContentPresets.csr)}
                </div>
              </div>
            </div>
          </div>
        )}

        {(responsibleJewelleryCouncilBlock || organicCottonBlock || colourStonesBlock) && (
          <div className={'py-16 md:mt-40'}>
            <div className={'mx-auto max-w-7xl px-4 md:px-8'}>
              <div className={'grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16'}>
                <div className={'space-y-8'}>
                  {responsibleJewelleryCouncilBlock && (
                    <div>
                      <h3 className={'font-sans text-sm font-medium tracking-wider'}>
                        {responsibleJewelleryCouncilBlock.title}
                      </h3>
                      <p className={'mb-4 text-sm font-light leading-relaxed text-gray-900'}>
                        {responsibleJewelleryCouncilBlock.description}
                      </p>
                      {responsibleJewelleryCouncilBlock.paragraph1 && (
                        <p className={'mb-4 text-sm font-light leading-relaxed text-gray-900'}>
                          {responsibleJewelleryCouncilBlock.paragraph1}
                        </p>
                      )}
                      {responsibleJewelleryCouncilBlock.paragraph2 && (
                        <p className={'text-sm font-light leading-relaxed text-gray-900'}>
                          {responsibleJewelleryCouncilBlock.paragraph2}
                        </p>
                      )}
                    </div>
                  )}

                  {organicCottonBlock && (
                    <div>
                      <h3 className={'font-sans text-sm font-medium tracking-wider'}>{organicCottonBlock.title}</h3>
                      <p className={'mb-4 text-sm font-light leading-relaxed text-gray-900'}>
                        {organicCottonBlock.description}
                      </p>
                      {organicCottonBlock.paragraph1 && (
                        <p className={'mb-4 text-sm font-light leading-relaxed text-gray-900'}>
                          {organicCottonBlock.paragraph1}
                        </p>
                      )}
                      {organicCottonBlock.paragraph2 && (
                        <p className={'text-sm font-light leading-relaxed text-gray-900'}>
                          {organicCottonBlock.paragraph2}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  {colourStonesBlock && (
                    <div>
                      <h3 className={'font-sans text-sm font-medium tracking-wider'}>{colourStonesBlock.title}</h3>
                      {colourStonesBlock.paragraph3 &&
                        renderRichContent(colourStonesBlock.paragraph3, richContentPresets.csr)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!!(bannerImage2 as StoryblokImage)?.filename && (
          <div className={''}>
            <div>
              <Image
                className={'w-full object-cover lg:h-[600px]'}
                width={1200}
                height={400}
                src={(bannerImage2 as StoryblokImage).filename || ''}
                alt={(bannerImage2 as StoryblokImage).alt || 'Banner'}
              />
            </div>
          </div>
        )}

        {perfumesBlock && (
          <div className={'relative pb-8 md:px-28 md:pb-40 md:pt-20'}>
            {perfumesBlock.image && (
              <div
                className={
                  'absolute -top-24 left-1/2 mb-6 block w-[calc(100%-2rem)] -translate-x-1/2 transform lg:hidden'
                }
              >
                <Image
                  className={'h-[400px] w-full object-cover'}
                  width={400}
                  height={400}
                  src={perfumesBlock.image.filename}
                  alt={perfumesBlock.image.alt || perfumesBlock.title}
                />
              </div>
            )}
            <div className={'mx-4 flex flex-col pt-80 md:pt-0 lg:flex-row lg:items-center lg:gap-16 '}>
              <div className={'flex-1 px-4 md:px-0 lg:order-2'}>
                <div className={'ml-auto max-w-lg'}>
                  <h3 className={'mb-6 text-2xl font-light tracking-wider md:text-4xl lg:text-5xl'}>
                    {perfumesBlock.title}
                  </h3>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {perfumesBlock.description}
                  </p>
                  <p className={'mb-6 text-sm font-light leading-6 text-gray-900 md:text-base'}>
                    {perfumesBlock.paragraph1}
                  </p>
                  {perfumesBlock.paragraph3 && renderRichContent(perfumesBlock.paragraph3, richContentPresets.csr)}
                </div>
              </div>
              {perfumesBlock.image && (
                <div className={'absolute bottom-10 left-4 hidden lg:block xl:left-10'}>
                  <Image
                    className={'h-[750px] object-cover'}
                    width={600}
                    height={750}
                    src={perfumesBlock.image.filename}
                    alt={perfumesBlock.image.alt || perfumesBlock.title}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {packagingBlock && (
          <div className={'py-6'}>
            <div className={'mx-auto max-w-7xl px-4 md:px-8'}>
              <h2 className={'mb-4 text-4xl font-light md:text-5xl'}>{packagingBlock.title}</h2>
              <div className={'grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16'}>
                <div className={'space-y-6'}>
                  <p className={'text-sm font-light leading-relaxed text-gray-900'}>{packagingBlock.description}</p>
                  {packagingBlock.paragraph1 && (
                    <p className={'text-sm font-light leading-relaxed text-gray-900'}>{packagingBlock.paragraph1}</p>
                  )}
                </div>
                <div className={'space-y-3'}>
                  {packagingBlock.paragraph2 && (
                    <p className={'text-sm font-light leading-relaxed text-gray-900'}>{packagingBlock.paragraph2}</p>
                  )}
                  {packagingBlock.paragraph3 && renderRichContent(packagingBlock.paragraph3, richContentPresets.csr)}
                  {packagingBlock.paragraph4 && renderRichContent(packagingBlock.paragraph4, richContentPresets.csr)}
                </div>
              </div>
            </div>
          </div>
        )}

        {carouselBlocks.length > 0 && (
          <FaqCarousel
            items={carouselBlocks}
            headerText={t('faq.read-more-about-it-here')}
            backgroundColor={'bg-white'}
            urlPath={'/faq/materials'}
            buttonText={t('common.full-story')}
          />
        )}

        {BehindBeautyWithAThoughtBlock && (
          <div className={'mt-32 bg-porcelain md:mt-60 md:py-10'}>
            <div className={'relative pt-72 lg:hidden'}>
              <div className={'absolute -top-20 left-1/2 mx-auto h-96 w-11/12 -translate-x-1/2'}>
                <Image
                  className={'h-full w-full object-cover'}
                  fill
                  src={BehindBeautyWithAThoughtBlock.image?.filename || ''}
                  alt={BehindBeautyWithAThoughtBlock.image?.alt || BehindBeautyWithAThoughtBlock.title}
                />
              </div>
              <div className={'px-8 py-12 text-center'}>
                <h3 className={'mb-6 text-4xl font-light tracking-wider'}>{BehindBeautyWithAThoughtBlock.title}</h3>
                <p className={'mb-8 text-lg font-light leading-relaxed'}>{BehindBeautyWithAThoughtBlock.description}</p>
                <Button asChild className={'bg-creme px-8 py-4 text-sm uppercase tracking-wider'} size={'xl'}>
                  <Link href={BehindBeautyWithAThoughtBlock.title}>{t('common.read-more')}</Link>
                </Button>
              </div>
            </div>

            <div
              className={
                'relative mb-4 hidden h-[550px] w-4/5 items-center justify-start bg-alabaster px-16 md:mx-16 lg:flex'
              }
            >
              <div className={'flex w-full max-w-xl flex-col'}>
                <h3 className={'mb-4 text-5xl font-light'}>{BehindBeautyWithAThoughtBlock.title}</h3>
                <p className={'mb-6 font-light'}>{BehindBeautyWithAThoughtBlock.description}</p>
                <Button asChild className={'w-48 bg-creme py-4 uppercase'} size={'xl'}>
                  <Link href={BehindBeautyWithAThoughtBlock.title}>{t('common.read-more')}</Link>
                </Button>
              </div>
              <Image
                className={'absolute -right-36 h-[470px] w-[600px] object-cover'}
                height={600}
                width={600}
                src={BehindBeautyWithAThoughtBlock.image?.filename || ''}
                alt={BehindBeautyWithAThoughtBlock.image?.alt || BehindBeautyWithAThoughtBlock.title}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSRPage;
