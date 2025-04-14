import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @CurrentUser('userId') userId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const categoryNames = body.categoryNames
      ? Array.isArray(body.categoryNames)
        ? body.categoryNames
        : [body.categoryNames]
      : [];

    const dto: CreateProductDto & { categoryNames?: string[] } = {
      ...body,
      categoryNames,
    };

    return this.productService.create(userId, dto, files);
  }

  @Get('by-catalogue/:slug')
  findAllFromCatalogue(@Param('slug') slug: string) {
    return this.productService.findAllFromCatalogue(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.productService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/image')
  async removeImage(
    @Param('id') productId: string,
    @Query('url') url: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.productService.deleteImage(productId, url, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const categoryNames = body.categoryNames
      ? Array.isArray(body.categoryNames)
        ? body.categoryNames
        : [body.categoryNames]
      : [];

    const dto: UpdateProductDto & { categoryNames?: string[] } = {
      ...body,
      categoryNames,
    };

    return this.productService.update(id, userId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.productService.delete(id, userId);
  }
}
