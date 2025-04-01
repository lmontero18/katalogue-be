import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id: dto.catalogueId },
    });

    if (!catalogue) throw new NotFoundException('Catalogue Not Found');
    if (catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    return this.prisma.product.create({
      data: {
        ...dto,
      },
    });
  }

  async findAllFromCatalogue(slug: string) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { slug },
      include: { products: true },
    });

    if (!catalogue) throw new NotFoundException('Catalogue not found');

    return catalogue.products;
  }

  async update(productId: string, userId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { catalogue: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { ...dto },
    });
  }

  async delete(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { catalogue: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
