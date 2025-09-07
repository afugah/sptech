import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { SearchConfigurationWithMarket } from '@/src/lib/configuration/search/Base';

export class SearchConfigurationAlgolia extends SearchConfigurationWithMarket {
  @Expose({ name: 'appId' })
  @IsNotEmpty()
  public AppId!: string;

  @Expose({ name: 'indexName' })
  @IsNotEmpty()
  public IndexName!: string;
}
