import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['CRC', 'USD', 'MXN', 'COP', 'ARS', 'PEN', 'CLP'])
  currency: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  status?: ProductStatus;

  @IsNotEmpty()
  @IsString()
  catalogueId: string;
}
