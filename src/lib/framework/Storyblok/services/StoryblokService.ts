import { compact } from 'lodash';
import { singleton } from 'tsyringe';
import { type LoggerService } from '@/src/lib/framework/Logger/services/LoggerService';
import { injectLogger } from '@/src/lib/framework/Logger/shared/InjectLogger';
import { getStoryblokInstance } from '@/src/lib/framework/Storyblok/shared/storyblokInstance';
import { isStorybookLinks } from '@/src/lib/framework/Storyblok/shared/typeGuard';

@singleton()
export class StoryblokService {
  protected readonly storyblokApi = getStoryblokInstance();

  public constructor(@injectLogger('StoryblokService') private readonly _logger: LoggerService) {}

  public getAllPageSlugs = async () => {
    const { data } = await this.storyblokApi.get('cdn/links/', {
      version: 'published',
      per_page: 1000,
    });

    if (!isStorybookLinks(data)) {
      this._logger.error('Failed to receive storybook links!');
      return [];
    }

    const paths = Object.values(data.links).reduce((result, link) => {
      if (link.slug === 'home' || link.real_path === '/') return result;

      if (!link.alternates?.length) {
        const slug = compact(link.slug.split('/'));

        return [...result, { slug }];
      } else {
        const newPath = link.alternates
          .filter((alternate) => ['se', 'fi', 'nb'].includes(alternate.lang))
          .map((alternate) => ({
            locale: alternate.lang === 'nb' ? 'no' : alternate.lang,
            slug: compact(alternate.translated_slug.split('/')),
          }));

        return [...result, ...newPath];
      }
    }, new Array<{ locale?: string; slug: string[] }>());

    return paths;
  };
}
