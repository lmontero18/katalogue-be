import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCatalogueDto {
  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsOptional()
  @IsUrl({}, { message: 'Must be a valid url' })
  storeImageUrl?: string;

  @IsNotEmpty()
  @IsUrl({}, { message: 'Must be a valid url' })
  contactLink: string;
}
