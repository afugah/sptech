import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class ShoplabConfiguration {
  @Expose({ name: 'apiUrl' })
  @IsNotEmpty()
  public ApiUrl!: string;

  @Expose({ name: 'apiKey' })
  @IsNotEmpty()
  public ApiKey!: string;
}
