import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

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
  @IsUrl({}, { message: 'Must be a valid URL' })
  contactLink: string;
}
