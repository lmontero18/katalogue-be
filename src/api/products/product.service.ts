import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { ImageService } from 'src/shared/services/Images/images.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly imageService: ImageService,
  ) {}

  async create(
    userId: string,
    dto: CreateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id: dto.catalogueId },
    });

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    if (catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    if (files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    if (files.length > 3) {
      throw new BadRequestException('You can upload up to 3 images only');
    }

    const imageUrls: string[] = [];

    for (const file of files) {
      this.imageService.validateImageFile(file);
      const compressedBuffer = await this.imageService.compressImage(file);

      const path = `products/${randomUUID()}-${file.originalname}.webp`;
      const url = await this.supabaseService.uploadImage(
        { ...file, buffer: compressedBuffer },
        path,
      );

      imageUrls.push(url);
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        currency: dto.currency,
        details: dto.details,
        status: dto.status,
        catalogueId: dto.catalogueId,
      } as Prisma.ProductUncheckedCreateInput,
    });

    await this.prisma.productImage.createMany({
      data: imageUrls.map((url) => ({
        productId: product.id,
        url,
      })),
    });

    return product;
  }

  async update(
    productId: string,
    userId: string,
    dto: UpdateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        catalogue: true,
        images: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    const totalImages = product.images.length + files.length;
    if (totalImages > 3) {
      throw new BadRequestException(
        'Solo se permiten hasta 3 imágenes por producto',
      );
    }

    if (files.length > 0) {
      const newImageUrls: string[] = [];

      for (const file of files) {
        this.imageService.validateImageFile(file);
        const compressedBuffer = await this.imageService.compressImage(file);

        const path = `products/${randomUUID()}-${file.originalname}.webp`;
        const url = await this.supabaseService.uploadImage(
          { ...file, buffer: compressedBuffer },
          path,
        );

        newImageUrls.push(url);
      }

      await this.prisma.productImage.createMany({
        data: newImageUrls.map((url) => ({
          productId,
          url,
        })),
      });
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        price: dto.price,
        currency: dto.currency,
        details: dto.details,
        status: dto.status,
      },
    });
  }

  async findAllFromCatalogue(slug: string) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!catalogue) throw new NotFoundException('Catalogue not found');
    return catalogue.products;
  }

  async findById(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        catalogue: true,
        images: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    return product;
  }

  async deleteImage(productId: string, url: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { catalogue: true },
    });

    if (!product || product.catalogue.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a este producto');
    }

    await this.supabaseService.deleteImagesByUrls([url]);

    await this.prisma.productImage.deleteMany({
      where: {
        productId,
        url,
      },
    });

    return { message: 'Imagen eliminada correctamente' };
  }

  async delete(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        catalogue: true,
        images: true,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this product');
    }

    await this.supabaseService.deleteImagesByUrls(
      product.images.map((img) => img.url),
    );

    await this.prisma.productImage.deleteMany({
      where: { productId },
    });

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
