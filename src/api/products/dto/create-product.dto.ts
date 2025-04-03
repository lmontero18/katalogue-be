import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  status?: ProductStatus;

  @IsNotEmpty()
  @IsString()
  catalogueId: string;
}
