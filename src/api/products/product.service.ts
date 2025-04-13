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
    dto: CreateProductDto & { categoryNames?: string[] },
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
      },
    });

    await this.prisma.productImage.createMany({
      data: imageUrls.map((url) => ({
        productId: product.id,
        url,
      })),
    });

    // Categorías
    if (dto.categoryNames && dto.categoryNames.length > 0) {
      const cleanedNames = dto.categoryNames
        .map((name) => name.trim().toLowerCase())
        .filter((n) => n !== '');

      const uniqueNames = Array.from(new Set(cleanedNames));

      const existingCategories = await this.prisma.category.findMany({
        where: {
          catalogueId: dto.catalogueId,
          name: { in: uniqueNames },
        },
      });

      const existingNames = existingCategories.map((c) => c.name);
      const namesToCreate = uniqueNames.filter(
        (name) => !existingNames.includes(name),
      );

      const newCategories = await Promise.all(
        namesToCreate.map((name) =>
          this.prisma.category.create({
            data: {
              name,
              catalogueId: dto.catalogueId,
            },
          }),
        ),
      );

      const allCategories = [...existingCategories, ...newCategories];

      await this.prisma.productCategory.createMany({
        data: allCategories.map((c) => ({
          productId: product.id,
          categoryId: c.id,
        })),
        skipDuplicates: true,
      });
    }

    return product;
  }

  async update(
    productId: string,
    userId: string,
    dto: UpdateProductDto & { categoryNames?: string[] },
    files: Express.Multer.File[] = [],
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        catalogue: true,
        images: true,
        categories: true,
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

    // 🧠 Actualizar categorías
    if (dto.categoryNames && dto.categoryNames.length > 0) {
      const names = Array.from(
        new Set(dto.categoryNames.map((n) => n.trim().toLowerCase())),
      ).filter((n) => n !== '');

      const existing = await this.prisma.category.findMany({
        where: {
          catalogueId: product.catalogueId,
          name: { in: names },
        },
      });

      const existingNames = existing.map((c) => c.name);

      const toCreate = names.filter((n) => !existingNames.includes(n));
      const newCategories = await Promise.all(
        toCreate.map((name) =>
          this.prisma.category.create({
            data: {
              name,
              catalogueId: product.catalogueId,
            },
          }),
        ),
      );

      const allCategories = [...existing, ...newCategories];

      await this.prisma.productCategory.deleteMany({
        where: { productId },
      });

      await this.prisma.productCategory.createMany({
        data: allCategories.map((cat) => ({
          productId,
          categoryId: cat.id,
        })),
        skipDuplicates: true,
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
            categories: {
              include: {
                category: true,
              },
            },
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
        categories: {
          include: {
            category: true,
          },
        },
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

    // ⛔️ Eliminar imágenes del storage
    await this.supabaseService.deleteImagesByUrls(
      product.images.map((img) => img.url),
    );

    // 🧽 Eliminar imágenes de la DB
    await this.prisma.productImage.deleteMany({
      where: { productId },
    });

    // ✅ Eliminar relaciones con categorías
    await this.prisma.productCategory.deleteMany({
      where: { productId },
    });

    // ✅ Finalmente eliminar el producto
    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
