import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { type IRetain24 } from '@/src/types/api/gift-cards';

export class GiftCartUseRequest implements IRetain24.GiftCartUseRequest {
  @IsNotEmpty()
  @IsString()
  public id!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5)
  public pin!: string;

  public get Id(): string {
    return this.id;
  }

  public ToBody(): IRetain24.GiftCartUseBody {
    return {
      pin: this.pin,
    };
  }

  public ToJson(): string {
    return JSON.stringify(this.ToBody());
  }
}
