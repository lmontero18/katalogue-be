import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { CatalogueModule } from './api/catalogues/catalogue.module';
import { ProductModule } from './api/products/product.controller';

@Module({
  imports: [PrismaModule, AuthModule, CatalogueModule, ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
