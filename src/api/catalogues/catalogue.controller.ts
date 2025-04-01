import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('catalogues')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCatalogueDto,
  ) {
    return this.catalogueService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMine(@CurrentUser('userId') userId: string) {
    return this.catalogueService.findMyCatalogue(userId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.catalogueService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateCatalogueDto,
  ) {
    return this.catalogueService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.catalogueService.delete(id, userId);
  }
}
