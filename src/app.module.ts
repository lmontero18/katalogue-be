import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { AuthModule } from './api/auth/auth.module';
import { CatalogueModule } from './api/catalogues/catalogue.module';
import { ProductModule } from './api/products/product.controller';
import { HealthModule } from './api/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './api/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CatalogueModule,
    ProductModule,
    HealthModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
