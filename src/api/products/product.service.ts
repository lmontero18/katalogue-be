import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    userId: string,
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id: dto.catalogueId },
    });

    if (!catalogue) throw new NotFoundException('Catalogue Not Found');
    if (catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    let imageUrl = '';
    if (file) {
      const path = `products/${Date.now()}-${file.originalname}`;
      imageUrl = await this.supabaseService.uploadImage(file, path);
    }

    return this.prisma.product.create({
      data: {
        ...dto,
        imageUrl,
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

  async findById(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { catalogue: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return product;
  }

  async update(
    productId: string,
    userId: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { catalogue: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    let imageUrl = product.imageUrl;

    if (file) {
      const path = `products/${Date.now()}-${file.originalname}`;
      imageUrl = await this.supabaseService.uploadImage(file, path);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...dto,
        imageUrl,
      },
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
