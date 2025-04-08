import { BadRequestException, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  validateImageFile(file: Express.Multer.File) {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagen no permitido. Solo JPG, PNG o WebP.',
      );
    }

    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException('La imagen no puede superar los 5MB.');
    }
  }

  async compressImage(file: Express.Multer.File): Promise<Buffer> {
    return await sharp(file.buffer)
      .resize({ width: 1200 }) // o el tamaño que prefieras
      .webp({ quality: 80 }) // o .jpeg({ quality: 80 }) si preferís
      .toBuffer();
  }
}
