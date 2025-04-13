import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class UpdateProductCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
