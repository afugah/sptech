import { Expose } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, Length } from 'class-validator';

export interface ISearchConfigurationTypesense {
  Host: string;
  Port: number;
  Protocol: 'http' | 'https';
  ApiKey: string;
  Collection: string;
  Language: string;
}

export class SearchConfigurationTypesense implements ISearchConfigurationTypesense {
  @Expose({ name: 'host' })
  @IsNotEmpty()
  public Host!: string;

  @Expose({ name: 'port' })
  @IsNumber()
  public Port!: number;

  @Expose({ name: 'protocol' })
  @IsIn(['http', 'https'])
  public Protocol!: 'http' | 'https';

  @Expose({ name: 'apiKey' })
  @IsNotEmpty()
  public ApiKey!: string;

  @Expose({ name: 'collection' })
  @IsNotEmpty()
  public Collection!: string;

  @Expose({ name: 'defaultLanguage' })
  @IsNotEmpty()
  @Length(2, 2)
  public Language!: string;
}
