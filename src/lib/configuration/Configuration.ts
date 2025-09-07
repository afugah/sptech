import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, Length, ValidateIf, ValidateNested } from 'class-validator';
import { injectable, singleton } from 'tsyringe';
import { ReviewsConfiguration } from '@/src/lib/configuration/ReviewsConfiguration';
import { SearchConfiguration } from '@/src/lib/configuration/search';
import { ShoplabConfiguration } from '@/src/lib/configuration/ShoplabConfiguration';
import { getLanguage, getMarketCode } from '@/src/util/locale';

export interface IConfiguration {
  Search: SearchConfiguration;
  Languages: string[];
  DefaultLanguage: string | null | undefined;

  Reviews: ReviewsConfiguration | null;

  Shoplab: ShoplabConfiguration;

  Debug: boolean;

  MarketAndLanguageList: string[];

  getLanguage(locale: string): string | undefined;
}

@injectable()
@singleton()
export class Configuration implements IConfiguration {
  @Expose({ name: 'search' })
  @Type(() => SearchConfiguration)
  @ValidateNested()
  @IsNotEmpty()
  public Search!: SearchConfiguration;

  @Expose({ name: 'languages' })
  @IsArray()
  @Length(2, 2, { each: true })
  public Languages!: string[];

  @Expose({ name: 'defaultLanguage' })
  @ValidateIf((o: IConfiguration) => o.Languages.length > 0 && !!o.DefaultLanguage)
  @Length(2, 2)
  public DefaultLanguage!: string | null | undefined;

  @Expose({ name: 'reviews' })
  @Type(() => ReviewsConfiguration)
  @ValidateIf((o: IConfiguration) => o.Reviews !== null)
  @ValidateNested()
  public Reviews = null;

  @Expose({ name: 'shoplab' })
  @Type(() => ShoplabConfiguration)
  @ValidateNested()
  public Shoplab!: ShoplabConfiguration;

  @Expose({ name: 'debug' })
  @Type(() => Boolean)
  @IsBoolean()
  public Debug: boolean = false;

  @Expose()
  public get MarketAndLanguageList(): string[] {
    return this.Search.Markets.flatMap((market) => {
      if (!this.Languages.length) return [market.code.toLowerCase()];

      return this.Languages.map((lang) =>
        market.defaultLanguage === lang ? market.code.toLowerCase() : `${market.code}-${lang}`.toLowerCase(),
      );
    });
  }

  @Expose()
  public getLanguage(locale: string): string | undefined {
    const language = getLanguage(locale);
    if (language) return language;

    const marketCode = getMarketCode(locale);
    return this.Search.Markets.find((market) => market.code === marketCode)?.defaultLanguage;
  }
}
