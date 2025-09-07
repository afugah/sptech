import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReviewProviderEnum } from '@/src/lib/framework/Reviews/shared/ReviewProviderEnum';

export class ReviewsConfiguration {
  @Expose({ name: 'provider' })
  @IsNotEmpty()
  @IsEnum(ReviewProviderEnum)
  public Provider!: ReviewProviderEnum;

  @Expose({ name: 'apiUrl' })
  @IsNotEmpty()
  public ApiUrl!: string;

  @Expose({ name: 'apiKey' })
  @IsNotEmpty()
  public ApiKey!: string;

  @Expose({ name: 'secretKey' })
  @IsNotEmpty()
  public SecretKey!: string;
}
