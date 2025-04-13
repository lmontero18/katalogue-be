import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { CreateCatalogueDto, UpdateCatalogueDto } from './dto';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';
import { ImageService } from 'src/shared/services/Images/images.service';

@Injectable()
export class CatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly imageService: ImageService,
  ) {}

  async create(
    userId: string,
    dto: CreateCatalogueDto,
    file?: Express.Multer.File,
  ) {
    let imageUrl: string | undefined;

    if (file) {
      this.imageService.validateImageFile(file);

      const compressedBuffer = await this.imageService.compressImage(file);
      const path = `catalogues/${dto.slug}-${Date.now()}.webp`;

      imageUrl = await this.supabaseService.uploadImage(
        { ...file, buffer: compressedBuffer },
        path,
      );
    }

    // Validación según método de contacto
    const isWhatsapp = dto.contactMethod === 'WHATSAPP' && !dto.whatsappNumber;
    const isInstagram =
      dto.contactMethod === 'INSTAGRAM' && !dto.instagramUsername;
    const isFacebook = dto.contactMethod === 'FACEBOOK' && !dto.facebookUrl;

    if (isWhatsapp || isInstagram || isFacebook) {
      throw new BadRequestException(
        `Missing required contact field for method: ${dto.contactMethod}`,
      );
    }

    // Limpiar campos que no se usan
    if (dto.contactMethod !== 'WHATSAPP') dto.whatsappNumber = undefined;
    if (dto.contactMethod !== 'INSTAGRAM') dto.instagramUsername = undefined;
    if (dto.contactMethod !== 'FACEBOOK') dto.facebookUrl = undefined;

    return await this.prisma.catalogue.create({
      data: {
        slug: dto.slug,
        businessName: dto.businessName,
        contactMethod: dto.contactMethod,
        whatsappNumber: dto.whatsappNumber,
        instagramUsername: dto.instagramUsername,
        facebookUrl: dto.facebookUrl,
        storeLink: dto.storeLink,
        storeImageUrl: imageUrl || '',
        userId,
      },
    });
  }

  async findMyCatalogue(userId: string) {
    return await this.prisma.catalogue.findMany({
      where: { userId },
    });
  }

  private generateContactLink(catalogue: any): string | null {
    switch (catalogue.contactMethod) {
      case 'WHATSAPP':
        return catalogue.whatsappNumber
          ? `https://wa.me/${catalogue.whatsappNumber.replace(/\D/g, '')}`
          : null;
      case 'INSTAGRAM':
        return catalogue.instagramUsername
          ? `https://instagram.com/${catalogue.instagramUsername}`
          : null;
      case 'FACEBOOK':
        return catalogue.facebookUrl || null;
      default:
        return catalogue.storeLink || null;
    }
  }

  async findBySlug(slug: string) {
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

    if (!catalogue) {
      throw new BadRequestException('Catálogo no encontrado');
    }

    const contactLink = this.generateContactLink(catalogue);

    return {
      ...catalogue,
      contactLink,
    };
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCatalogueDto,
    file?: Express.Multer.File,
  ) {
    const catalogue = await this.prisma.catalogue.findUnique({
      where: { id },
    });

    if (!catalogue || catalogue.userId !== userId) {
      throw new ForbiddenException('You do not own this catalogue');
    }

    let imageUrl = catalogue.storeImageUrl;

    if (file) {
      this.imageService.validateImageFile(file);

      const compressedBuffer = await this.imageService.compressImage(file);
      const path = `catalogues/${catalogue.slug}-${Date.now()}.webp`;

      imageUrl = await this.supabaseService.uploadImage(
        { ...file, buffer: compressedBuffer },
        path,
      );
    }

    // Validación de contacto si se actualiza
    if (dto.contactMethod) {
      const isWhatsapp =
        dto.contactMethod === 'WHATSAPP' && !dto.whatsappNumber;
      const isInstagram =
        dto.contactMethod === 'INSTAGRAM' && !dto.instagramUsername;
      const isFacebook = dto.contactMethod === 'FACEBOOK' && !dto.facebookUrl;

      if (isWhatsapp || isInstagram || isFacebook) {
        throw new BadRequestException(
          `Missing required contact field for method: ${dto.contactMethod}`,
        );
      }

      // Limpiar campos no usados
      if (dto.contactMethod !== 'WHATSAPP') dto.whatsappNumber = undefined;
      if (dto.contactMethod !== 'INSTAGRAM') dto.instagramUsername = undefined;
      if (dto.contactMethod !== 'FACEBOOK') dto.facebookUrl = undefined;
    }

    if (dto.storeLink?.trim() === '') {
      dto.storeLink = null;
    }

    return await this.prisma.catalogue.update({
      where: { id },
      data: {
        ...dto,
        storeImageUrl: imageUrl,
      },
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
