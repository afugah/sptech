import { getStoryblokApi } from '@storyblok/react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createSearchParamsCache, type SearchParams } from 'nuqs/server';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import TurndownService from 'turndown';
import { type StoryblokRichtext } from '@/.storyblok/types/storyblok';
import PageHeader from '@/src/components/header/PageHeader';
import Breadcrumbs from '@/src/components/product/page/Breadcrumbs';
import { ProductGridLoader } from '@/src/components/product/ProductGrid/ProductGridLoader';
import ProductionComponent from '@/src/components/storyBlok/ProductionComponent';
import { TagList } from '@/src/components/ui/TagList';
import { isFutureDate } from '@/src/helpers/futureDate';
import { getFiltersParser } from '@/src/helpers/searchParams';
import { Link } from '@/src/i18n/navigation';
import { di } from '@/src/lib/di';
import { CollectionService } from '@/src/lib/framework/Collection/services/CollectionService';
import { type ICollectionSearch } from '@/src/lib/framework/Collection/types/ICollectionSearch';
import { type CollectionPage, type MenuLink } from '@/src/types/framework/storyblok-components';
import { type StoryblokContent } from '@/src/types/framework/storyblok-helpers';
import isPreviewEnvironment from '@/src/util/isPreviewEnvironment';
import { getMarketCode } from '@/src/util/locale';
import { renderRichContent } from '@/src/utils/storyblok/renderRichContent';

type ICategoryPageProps = {
  story: {
    name: string;
    content: CollectionPage;
    parent_id?: number;
    id: number;
    full_slug: string;
    default_full_slug: string;
    translated_slugs: TranslatedSlug[];
  };
  slug: string;
  locale: string;
  searchParams: { page?: string } & SearchParams;
};

interface TranslatedSlug {
  lang: string;
  path: string;
  name: string;
}

const CollectionPageTemplate: React.FC<ICategoryPageProps> = async (props) => {
  const { slug, story, locale, searchParams } = props;

  const {
    title,
    subtitle,
    description,
    CollectionDescription,
    storyblokDescription,
    customTitle,
    releaseDate,
    footerSeoTitle,
    footerSeoDescription,
    hideTitle,
    hideDescription,
    hideBreadcrumbs,
    heroImage,
  } = story.content;
  const storyblokApi = getStoryblokApi();
  const renderDescription = (description: StoryblokRichtext) => {
    return description ? renderRichContent(description) : null;
  };

  const cleanFooterSeoDescription = footerSeoDescription?.replace(/&lt;div&gt;/g, '').replace(/&lt;\/div&gt;/g, '');

  const turndownService = new TurndownService();
  const footerSeoDescriptionMarkdown = turndownService.turndown(cleanFooterSeoDescription || '');

  const RenderedCollectionDescription =
    storyblokDescription?.content && storyblokDescription?.content?.length > 2
      ? renderDescription(storyblokDescription as StoryblokRichtext)
      : typeof CollectionDescription === 'string'
        ? CollectionDescription
        : null;

  const marketCode = getMarketCode(locale);

  const collectionService = di.resolve(CollectionService);
  const facets = await collectionService.getFacetsBySlugOrQuery(marketCode, slug);

  const priceFacet = facets.find((facet) => facet.name === 'price');

  const config = di.resolve(di.Tokens.Configuration);
  const language = config.getLanguage(locale);

  let subCategories: Array<{ url: string; label: string }> = [];
  const slashCount = (story.default_full_slug.match(/\//g) || []).length;
  const version = isPreviewEnvironment() ? 'draft' : 'published';

  const { data: subCategoriesComponent } = await storyblokApi.get(`cdn/stories`, {
    version,
    level: slashCount === 3 ? slashCount : slashCount + 1,
    // is_startpage: true,
    language,
    starts_with: slug,
  });

  subCategories = (subCategoriesComponent.stories as unknown as CollectionPage[])
    .filter((item) => {
      // Safety guards to prevent runtime crashes
      if (!item || typeof item !== 'object') return false;
      if (!item.full_slug || typeof item.full_slug !== 'string') return false;
      if (!item.content || typeof item.content !== 'object') return false;
      if (!item.id || item.id === story.id) return false;

      const lastSlug = item.full_slug.split(`${slug}`)[1];
      const isDeeper = lastSlug?.split('/')?.length > 2 && lastSlug[lastSlug.length - 1] !== '/';

      return !(item.content as StoryblokContent).hidePill && !isDeeper;
    })
    .sort((a, b) => {
      const orderA = ((a.content as StoryblokContent)?.collectionSortOrder as number) || 50;
      const orderB = ((b.content as StoryblokContent)?.collectionSortOrder as number) || 50;
      return orderA - orderB;
    })
    .map((c) => {
      // Safety guard for translated_slugs
      const translatedSlugs = (c as StoryblokContent).translated_slugs;
      if (Array.isArray(translatedSlugs)) {
        const translated = translatedSlugs.find((a: TranslatedSlug) => a.lang === language);
        if (translated?.path && translated?.name) {
          return {
            url: `/${translated.path}`,
            label: translated.name,
          };
        }
      }

      return {
        url: c.full_slug ? `/${c.full_slug}` : '#',
        label: ((c as StoryblokContent).name as string) || 'Unknown Category',
      };
    });

  const defaultSort: ICollectionSearch.Sort = {
    field: 'relevance',
    order: 'asc',
  };

  const defaultFilters: ICollectionSearch.Filter = createSearchParamsCache(
    getFiltersParser({
      category: [],
      price:
        priceFacet?.type === 'range'
          ? {
              // min: priceFacet.min,
              // max: priceFacet.max,
              min: 0,
              max: 50000,
            }
          : {
              min: 0,
              max: 50000,
            },
    }),
  ).parse(searchParams);

  const t = await getTranslations();

  return (
    <>
      <PageHeader
        header_menu={((story.content as StoryblokContent)?.header_menu as MenuLink[]) || []}
        _uid={story.content._uid}
        component={'config'}
        hasHeaderFixed={true}
      />
      <ProductionComponent story={story} />
      <div className={'bg-[#ece0db]'}>
        <div className={'h-hero-image-category lg:h-screen-75 relative w-full overflow-hidden bg-cover'}>
          <Image
            src={heroImage?.filename || '/images/efva-category-1920x1080.jpg'}
            alt={heroImage?.alt || `Category hero image ${title}`}
            width={heroImage?.width || 1920}
            height={heroImage?.height || 1080}
            className={'h-[580px] w-full object-cover'}
          />
        </div>
        <div className={'mb-8 flex flex-col justify-between'}>
          {!hideTitle && (
            <div className={'relative mt-12 text-center lg:mt-24'}>
              <h1
                aria-hidden={'true'}
                className={
                  'absolute left-1/2 top-[45%] mb-0 block w-full -translate-x-1/2 -translate-y-1/2 transform font-sans text-sm font-bold uppercase text-black lg:text-lg'
                }
              >
                {customTitle || title}
              </h1>
              <h2 className={'text-center text-7xl uppercase text-white md:text-[120px]'}>{title}</h2>
            </div>
          )}
          {subtitle && <h2 className={'text-center'}>{subtitle}</h2>}
          {typeof description === 'string' && description && !hideDescription && (
            <p className={'text-center'}>{description}</p>
          )}
          <div
            className={
              'm-0 mx-auto mt-2 max-w-2xl overflow-hidden overflow-ellipsis whitespace-normal text-center text-lg font-light'
            }
          >
            {RenderedCollectionDescription}
          </div>
        </div>
        {!hideBreadcrumbs && (
          <Breadcrumbs className={'mb-10 flex items-center justify-center text-center text-sm font-bold uppercase'}>
            <li>
              <Link href={'/'} className={'uppercase'}>
                {t('common.home')}
              </Link>
            </li>
            {slug && slug.includes('/') ? (
              slug.split('/').map((part, index, arr) => {
                const href = '/' + arr.slice(0, index + 1).join('/');
                return (
                  <li key={index}>
                    {index === arr.length - 1 ? (
                      <Link href={href} className={'uppercase'}>
                        {title}
                      </Link>
                    ) : (
                      <Link href={href} className={'uppercase'}>
                        {part}
                      </Link>
                    )}
                  </li>
                );
              })
            ) : (
              <li>{title}</li>
            )}
          </Breadcrumbs>
        )}
        <TagList tags={subCategories} className={'mt-8'} template={'square'} />
        {releaseDate && typeof releaseDate === 'string' && isFutureDate(releaseDate) ? (
          // TODO: Add countdown?
          // <div className={'py-10 text-sm text-center text-gray-300'}>{releaseDate}</div>
          <div></div>
        ) : (
          <ProductGridLoader
            slug={slug}
            searchParams={searchParams}
            defaultSort={defaultSort}
            defaultFilters={defaultFilters}
            facets={facets}
            useViewMore={true}
            showSearchFilter={false}
          />
        )}
        {(footerSeoTitle || footerSeoDescription) && (
          <div className={'mt-12'}>
            {footerSeoTitle && <h2 className={'mb-1 text-base'}>{footerSeoTitle}</h2>}
            {footerSeoDescriptionMarkdown && (
              <div
                className={
                  'mx-auto mb-10 mt-2 max-w-screen-xl overflow-hidden overflow-ellipsis whitespace-normal font-sans text-sm text-gray-800'
                }
              >
                <ReactMarkdown
                  components={{
                    h1: ({ ...props }) => (
                      <h2 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    h4: ({ ...props }) => (
                      <h4 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    h5: ({ ...props }) => (
                      <h5 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    h6: ({ ...props }) => (
                      <h6 {...props} className={'mb-1 mt-2.5 font-sans text-sm font-bold text-gray-800'} />
                    ),
                    a: ({ ...props }) => <a {...props} className={'underline'} />,
                    p: ({ ...props }) => <p {...props} className={'mb-2'} />,
                    strong: ({ ...props }) => <strong {...props} className={'font-sans font-bold'} />,
                  }}
                >
                  {footerSeoDescriptionMarkdown}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CollectionPageTemplate;
