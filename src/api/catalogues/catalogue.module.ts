import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { PrismaModule } from 'src/shared/services/prisma/prisma.module';
import { SupabaseService } from 'src/shared/services/supabase/storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [CatalogueController],
  providers: [CatalogueService, SupabaseService],
})
export class CatalogueModule {}
