import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCatalogueDto {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9+]+$/, {
    message: 'Phone number must contain only numbers or +',
  })
  phoneNumber: string;

  @IsOptional()
  @IsString({ message: 'Invalid image format' })
  storeImageUrl?: string;

  @IsNotEmpty()
  @IsUrl({}, { message: 'Debe ser una URL válida (ej: https://...)' })
  @Transform(({ value }) =>
    value.startsWith('http://') || value.startsWith('https://')
      ? value
      : `https://${value}`,
  )
  contactLink: string;
}
