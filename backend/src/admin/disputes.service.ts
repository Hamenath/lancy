import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditLogService } from './audit-log.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface OpenDisputeDto {
  reason: string;
  description: string;
}

export interface ResolveDisputeDto {
  resolution: string;
  status?: string; // RESOLVED | CLOSED
}

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private notificationsService: NotificationsService,
  ) {}

  async openDispute(contractId: string, userId: string, dto: OpenDisputeDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      throw new ForbiddenException('Only contract participants can open a dispute');
    }

    const existingOpen = await this.prisma.dispute.findFirst({
      where: {
        contractId,
        status: { in: ['OPEN', 'UNDER_REVIEW', 'WAITING_FOR_RESPONSE'] },
      },
    });

    if (existingOpen) {
      throw new BadRequestException('An active dispute is already open for this contract');
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        contractId,
        openedById: userId,
        reason: dto.reason,
        description: dto.description.trim(),
        status: 'OPEN',
      },
      include: {
        contract: true,
        openedBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify other participant & admin
    const otherUserId = contract.clientId === userId ? contract.freelancerId : contract.clientId;
    await this.notificationsService.createNotification({
      userId: otherUserId,
      type: 'DISPUTE_OPENED',
      title: 'Dispute Opened on Contract',
      message: `A dispute has been opened for "${contract.title}". An admin will review the matter.`,
      metadata: { contractId, disputeId: dispute.id },
    });

    return dispute;
  }

  async getDisputeById(id: string, userId: string, userRole: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        contract: {
          include: { client: true, freelancer: true, milestones: true, payments: true },
        },
        openedBy: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }

    const isParticipant = dispute.contract.clientId === userId || dispute.contract.freelancerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isParticipant && !isAdmin) {
      throw new ForbiddenException('You are not authorized to view this dispute');
    }

    return dispute;
  }

  async getAllDisputes(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return this.prisma.dispute.findMany({
      where,
      include: {
        contract: { select: { id: true, title: true, agreedAmount: true } },
        openedBy: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveDispute(id: string, adminId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.status || 'RESOLVED',
        resolution: dto.resolution,
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    // Write audit log
    await this.auditLogService.log({
      actorId: adminId,
      action: 'DISPUTE_RESOLVED',
      entityType: 'Dispute',
      entityId: id,
      metadata: { resolution: dto.resolution, contractId: dispute.contractId },
    });

    // Notify both participants
    await Promise.all([
      this.notificationsService.createNotification({
        userId: dispute.contract.clientId,
        type: 'DISPUTE_RESOLVED',
        title: 'Dispute Resolved',
        message: `Dispute on contract "${dispute.contract.title}" has been resolved by Admin.`,
        metadata: { disputeId: id, contractId: dispute.contractId },
      }),
      this.notificationsService.createNotification({
        userId: dispute.contract.freelancerId,
        type: 'DISPUTE_RESOLVED',
        title: 'Dispute Resolved',
        message: `Dispute on contract "${dispute.contract.title}" has been resolved by Admin.`,
        metadata: { disputeId: id, contractId: dispute.contractId },
      }),
    ]);

    return updated;
  }
}
