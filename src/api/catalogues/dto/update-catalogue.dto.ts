import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogueDto } from '.';

export class UpdateCatalogueDto extends PartialType(CreateCatalogueDto) {}
