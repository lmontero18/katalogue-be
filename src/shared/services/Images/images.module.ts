import { Module } from '@nestjs/common';
import { ImageService } from './images.service';
@Module({
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
