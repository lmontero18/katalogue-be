import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  ValidateIf,
  IsUrl,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ContactMethod {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
}

export class CreateCatalogueDto {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsEnum(ContactMethod, { message: 'Invalid contact method' })
  contactMethod: ContactMethod;

  @ValidateIf((o) => o.contactMethod === ContactMethod.WHATSAPP)
  @IsString()
  @Matches(/^[0-9+]+$/, {
    message: 'WhatsApp number must contain only numbers or +',
  })
  whatsappNumber?: string;

  @ValidateIf((o) => o.contactMethod === ContactMethod.INSTAGRAM)
  @IsString({ message: 'Instagram username must be a string' })
  instagramUsername?: string;

  @ValidateIf((o) => o.contactMethod === ContactMethod.FACEBOOK)
  @IsUrl({}, { message: 'Facebook URL must be a valid URL (e.g. https://...)' })
  facebookUrl?: string;

  @IsOptional()
  @IsString({ message: 'Invalid image URL format' })
  storeImageUrl?: string;

  
  @Transform(({ value }) => {
    if (!value || typeof value !== 'string') return null;
  
    const cleaned = value.trim().replace(/\s+/g, ''); // <- esto limpia TODO
  
    if (cleaned === '') return null;
  
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned;
    }
  
    return `https://${cleaned}`;
  })
  @IsOptional()
  @IsUrl({}, { message: 'Store link must be a valid URL (e.g. https://...)' })
  storeLink?: string;
  
}
