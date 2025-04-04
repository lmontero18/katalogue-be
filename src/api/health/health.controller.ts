// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$connect();
      return { status: 'ok' };
    } catch (e) {
      console.error('❌ Error al conectar con la DB', e);
      return { status: 'error', message: e.message };
    }
  }
}
