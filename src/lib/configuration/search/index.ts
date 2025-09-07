import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, Length, ValidateIf, ValidateNested } from 'class-validator';
import { SearchConfigurationAlgolia } from '@/src/lib/configuration/search/Algolia';
import { type ISearchConfigurationWithMarket } from '@/src/lib/configuration/search/Base';
import { SearchEngineEnum } from '@/src/lib/configuration/search/constants';
import { SearchConfigurationElasticSearch } from '@/src/lib/configuration/search/ElasticSearch';
import { SearchConfigurationFindify } from '@/src/lib/configuration/search/Findify';

export class SearchConfiguration {
  @Expose({ name: 'engine' })
  @IsNotEmpty()
  @IsEnum(SearchEngineEnum)
  public Engine!: SearchEngineEnum;

  @Expose({ name: 'defaultMarket' })
  @ValidateIf((o: SearchConfiguration) => !!o.DefaultMarket)
  @Length(2, 2)
  public DefaultMarket!: string | null | undefined;

  @Expose({ name: 'algolia' })
  @Type(() => SearchConfigurationAlgolia)
  @ValidateNested()
  @ValidateIf((o: SearchConfiguration) => o.Engine === SearchEngineEnum.ALGOLIA)
  @IsNotEmpty()
  public Algolia: Map<string, SearchConfigurationAlgolia> = new Map();

  @Expose({ name: 'findify' })
  @Type(() => SearchConfigurationFindify)
  @ValidateNested()
  @ValidateIf((o: SearchConfiguration) => o.Engine === SearchEngineEnum.FINDIFY)
  @IsNotEmpty()
  public Findify: Map<string, SearchConfigurationFindify> = new Map();

  @Expose()
  public get ActiveSearchEngine(): Map<string, ISearchConfigurationWithMarket> {
    switch (this.Engine) {
      case SearchEngineEnum.ALGOLIA:
        return this.Algolia;
      case SearchEngineEnum.FINDIFY:
        return this.Findify;
      default:
        throw new Error('Unknown search engine');
    }
  }

  @Expose({ name: 'elasticSearch' })
  @Type(() => SearchConfigurationElasticSearch)
  @ValidateNested()
  @IsNotEmpty()
  public ElasticSearch!: SearchConfigurationElasticSearch;

  @Expose()
  public get Markets(): { code: string; defaultLanguage: string; shoplabId: number }[] {
    return Array.from(this.ActiveSearchEngine)
      .sort(([code]) => (this.DefaultMarket ? (code === this.DefaultMarket ? -1 : 0) : 0))
      .map(([code, { Language, ShoplabId }]) => ({
        code,
        defaultLanguage: Language,
        shoplabId: ShoplabId,
      }));
  }
}
