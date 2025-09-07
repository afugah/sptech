import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUrl, Length } from 'class-validator';

export interface ISearchConfigurationBase {
  ApiKey: string;
  ApiWarehouseUrl: string;
  ApiUrl: string;
  Language: string;
}

export class SearchConfigurationBase implements ISearchConfigurationBase {
  @Expose({ name: 'apiKey' })
  @IsNotEmpty()
  public ApiKey!: string;

  @Expose({ name: 'apiUrl' })
  @IsUrl()
  public ApiUrl!: string;

  @Expose({ name: 'apiWarehouseUrl' })
  public ApiWarehouseUrl!: string;

  @Expose({ name: 'defaultLanguage' })
  @IsNotEmpty()
  @Length(2, 2)
  public Language!: string;
}

export interface ISearchConfigurationWithMarket extends ISearchConfigurationBase {
  ShoplabId: number;
}

export class SearchConfigurationWithMarket extends SearchConfigurationBase implements ISearchConfigurationWithMarket {
  @Expose({ name: 'shoplabId' })
  @IsNumber()
  @IsNotEmpty()
  public ShoplabId!: number;
}
