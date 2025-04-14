import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(
    dto: CreateCategoryDto & { catalogueSlug: string; userId: string },
  ) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { slug: dto.catalogueSlug },
    });

    if (!catalogue) {
      throw new NotFoundException('Catalogue not found');
    }

    if (catalogue.userId !== dto.userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        catalogueId: catalogue.id,
        name: dto.name,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A category with this name already exists for this catalogue',
      );
    }
    return this.prisma.category.create({
      data: {
        name: dto.name,
        catalogueId: catalogue.id,
      },
    });
  }

  async getCatalogueCategoriesBySlug(slug: string, userId: string) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { slug },
    });

    if (!catalogue) {
      throw new NotFoundException('Catalogue not found');
    }

    if (catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    return this.prisma.category.findMany({
      where: { catalogueId: catalogue.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteCategory(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { catalogue: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this category');
    }

    await this.prisma.productCategory.deleteMany({
      where: { categoryId: id },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
