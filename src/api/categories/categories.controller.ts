import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('slug/:slug')
  create(
    @CurrentUser('userId') userId: string,
    @Param('slug') slug: string,
    @Body() dto: Omit<CreateCategoryDto, 'catalogueId'>,
  ) {
    return this.categoryService.createCategory({
      ...dto,
      catalogueSlug: slug,
      userId,
    });
  }

  @Get('slug/:slug')
  getBySlug(
    @CurrentUser('userId') userId: string,
    @Param('slug') slug: string,
  ) {
    return this.categoryService.getCatalogueCategoriesBySlug(slug, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.categoryService.deleteCategory(id, userId);
  }
}
