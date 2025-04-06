import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from './dto';
import { Prisma } from '@prisma/client';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';

@Injectable()
export class CatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    userId: string,
    dto: CreateCatalogueDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      this.validateImageFile(file);

      const path = `catalogues/${dto.slug}-${Date.now()}.jpg`;
      imageUrl = await this.supabaseService.uploadImage(file, path);
    }

    return await this.prisma.catalogue.create({
      data: {
        ...dto,
        storeImageUrl: imageUrl || '',
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
      include: {
        products: {
          include: {
            images: true,
          },
        },
      },
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

  // 👇 Función privada para validar el archivo
  private validateImageFile(file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagen no permitido. Solo se permiten JPG, PNG o WebP.',
      );
    }

    // (Opcional) también podrías validar tamaño máximo, ejemplo 2MB
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException('La imagen no puede superar los 2MB.');
    }
  }
}
