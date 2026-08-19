import { 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeFreelancers,
      activeClients,
      activeProjects,
      activeContracts,
      completedContracts,
      openReports,
      openDisputes,
      paymentAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'FREELANCER', status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'CLIENT', status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { status: 'OPEN' } }),
      this.prisma.contract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { status: 'COMPLETED' } }),
      this.prisma.projectReport.count({ where: { status: 'OPEN' } }),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED' },
      }),
    ]);

    const totalVolumeMinor = paymentAggregate._sum.amount || 0;

    return {
      totalUsers,
      activeFreelancers,
      activeClients,
      activeProjects,
      activeContracts,
      completedContracts,
      openReports,
      openDisputes,
      totalVolumeMinor,
      formattedTotalVolume: `$${(totalVolumeMinor / 100).toFixed(2)}`,
    };
  }

  async getUsers(page = 1, limit = 20, role?: string, status?: string, q?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      const qLower = q.toLowerCase().trim();
      where.OR = [
        { name: { contains: qLower } },
        { email: { contains: qLower } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          photo: true,
          createdAt: true,
          profile: { select: { rating: true, reviewsCount: true } },
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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        projects: { take: 5, orderBy: { createdAt: 'desc' } },
        clientContracts: { take: 5, orderBy: { createdAt: 'desc' } },
        freelancerContracts: { take: 5, orderBy: { createdAt: 'desc' } },
        submittedReviews: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async suspendUser(adminId: string, userId: string, reason: string) {
    if (adminId === userId) {
      throw new BadRequestException('You cannot suspend your own admin account');
    }

    const user = await this.getUserById(userId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });

    await this.auditLogService.log({
      actorId: adminId,
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: userId,
      metadata: { reason, targetEmail: user.email },
    });

    return updated;
  }

  async restoreUser(adminId: string, userId: string) {
    const user = await this.getUserById(userId);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    await this.auditLogService.log({
      actorId: adminId,
      action: 'USER_RESTORED',
      entityType: 'User',
      entityId: userId,
      metadata: { targetEmail: user.email },
    });

    return updated;
  }

  async getProjects(page = 1, limit = 20, status?: string) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, email: true } },
          _count: { select: { proposals: true, reports: true } },
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

  async moderateProject(adminId: string, projectId: string, status: string) {
    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    await this.auditLogService.log({
      actorId: adminId,
      action: status === 'HIDDEN' ? 'PROJECT_HIDDEN' : 'PROJECT_RESTORED',
      entityType: 'Project',
      entityId: projectId,
      metadata: { status },
    });

    return updated;
  }

  async createProjectReport(userId: string, projectId: string, reason: string, description?: string) {
    return this.prisma.projectReport.create({
      data: {
        projectId,
        reporterId: userId,
        reason,
        description: description?.trim(),
        status: 'OPEN',
      },
    });
  }

  async getReports() {
    const [projectReports, reviewReports] = await Promise.all([
      this.prisma.projectReport.findMany({
        include: {
          project: { select: { id: true, title: true } },
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reviewReport.findMany({
        include: {
          review: { select: { id: true, comment: true } },
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      projectReports,
      reviewReports,
    };
  }

  async getPayments() {
    return this.prisma.payment.findMany({
      include: {
        payer: { select: { id: true, name: true, email: true } },
        contract: { select: { id: true, title: true, freelancerId: true } },
        milestone: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
