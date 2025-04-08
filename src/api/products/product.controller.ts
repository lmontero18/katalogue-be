import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { PrismaModule } from 'src/shared/services/prisma/prisma.module';
import { ProductController } from './product.module';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from 'src/shared/services/Images/images.module';

@Module({
  imports: [PrismaModule, ConfigModule, ImageModule],
  controllers: [ProductController],
  providers: [ProductService, SupabaseService],
})
export class ProductModule {}
