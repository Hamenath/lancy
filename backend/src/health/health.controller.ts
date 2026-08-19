import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'System health probe' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lancy-backend-api',
      uptime: process.uptime(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Container liveness probe' })
  getLive() {
    return { status: 'alive' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Container readiness probe & DB check' })
  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'connected',
      };
    } catch (err) {
      return {
        status: 'unready',
        database: 'disconnected',
        error: String(err),
      };
    }
  }
}
