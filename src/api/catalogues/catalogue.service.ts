import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCatalogueDto) {
    return await this.prisma.catalogue.create({
      data: {
        ...dto,
        userId,
      } as Prisma.CatalogueUncheckedCreateInput,
    });
  }

  async findMyCatalogue(userId: string) {
    return await this.prisma.catalogue.findMany({
      where: { userId },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.catalogue.findUnique({
      where: { slug },
      include: { products: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateCatalogueDto) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id },
    });

    if (!catalogue || catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    return await this.prisma.catalogue.update({
      where: { id },
      data: { ...dto },
    });
  }

  async delete(id: string, userId: string) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id },
    });

    if (!catalogue || catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    return await this.prisma.catalogue.delete({
      where: { id },
    });
  }
}
