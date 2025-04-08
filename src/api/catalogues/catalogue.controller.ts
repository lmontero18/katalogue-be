import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatalogueService } from './catalogue.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('catalogues')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCatalogueDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.catalogueService.create(userId, dto, file);
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
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateCatalogueDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.catalogueService.update(id, userId, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.catalogueService.delete(id, userId);
  }
}
