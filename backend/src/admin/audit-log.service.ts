import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateAuditLogDto {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Appends an immutable audit log entry.
   * Modifying or deleting audit history is strictly prohibited.
   */
  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        actorId: dto.actorId,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      },
    });
  }

  async getLogs(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }
}
