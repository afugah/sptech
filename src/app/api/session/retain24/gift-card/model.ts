import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { type IRetain24 } from '@/src/types/api/gift-cards';

// Default template ID if no matching market is found
const DEFAULT_TEMPLATE_ID = 1;

export class GiftCartProductRequest implements IRetain24.GiftCartProductRequest {
  @IsNotEmpty()
  @IsNumber()
  private readonly _templateId!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(1)
  private readonly _referenceNumber: string = process.env.RETAIN24_REFERENCE_NUMBER || '1';

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  public amountToLoad!: number;

  @IsNotEmpty()
  @IsDateString()
  public sendDate!: string;

  @IsNotEmpty()
  @IsEmail()
  public receivingEmail!: string;

  @IsString()
  @MaxLength(1000)
  public emailText: string = process.env.NEXT_PUBLIC_STORE_NAME || 'Retain24';

  constructor(data?: Partial<GiftCartProductRequest>, market?: string) {
    Object.assign(this, data);
    const templateIdKey = `RETAIN24_TEMPLATE_ID_${market}`;
    const templateId = process.env[templateIdKey];
    this._templateId = templateId ? Number(templateId) : DEFAULT_TEMPLATE_ID;
  }

  public ToBody(): IRetain24.GiftCartProductAddBody {
    return {
      amountToLoad: this.amountToLoad,
      sendDate: this.sendDate,
      receivingEmail: this.receivingEmail,
      emailText: this.emailText,
      referenceNumber: this._referenceNumber,
      templateId: this._templateId,
    };
  }

  public ToJson(): string {
    return JSON.stringify(this.ToBody());
  }
}
