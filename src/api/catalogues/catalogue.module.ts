import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { PrismaModule } from 'src/shared/services/prisma/prisma.module';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from 'src/shared/services/Images/images.module';

@Module({
  imports: [PrismaModule, ConfigModule, ImageModule],
  controllers: [CatalogueController],
  providers: [CatalogueService, SupabaseService],
})
export class CatalogueModule {}
