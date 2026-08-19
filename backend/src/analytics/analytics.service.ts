import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface TrackEventDto {
  eventType: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(actorId: string | null, dto: TrackEventDto) {
    return this.prisma.analyticsEvent.create({
      data: {
        eventType: dto.eventType,
        actorId: actorId || undefined,
        entityType: dto.entityType,
        entityId: dto.entityId,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      },
    });
  }

  async getFreelancerAnalytics(userId: string) {
    const [
      profileViewsCount,
      totalProposals,
      acceptedProposals,
      activeContracts,
      completedContracts,
      ledgerEntries,
      userProfile,
    ] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'PROFILE_VIEWED',
          entityId: userId,
        },
      }),
      this.prisma.proposal.count({ where: { freelancerId: userId } }),
      this.prisma.proposal.count({ where: { freelancerId: userId, status: 'ACCEPTED' } }),
      this.prisma.contract.count({ where: { freelancerId: userId, status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { freelancerId: userId, status: 'COMPLETED' } }),
      this.prisma.ledgerEntry.findMany({
        where: { userId, type: 'FREELANCER_EARNING', direction: 'CREDIT' },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
    ]);

    let totalEarningsMinor = 0;
    const monthlyEarningsMap: Record<string, number> = {};

    for (const entry of ledgerEntries) {
      totalEarningsMinor += entry.amount;
      const monthKey = new Date(entry.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyEarningsMap[monthKey] = (monthlyEarningsMap[monthKey] || 0) + entry.amount;
    }

    const earningsTimeSeries = Object.entries(monthlyEarningsMap).map(([month, amountMinor]) => ({
      month,
      amountMinor,
      formattedAmount: `$${(amountMinor / 100).toFixed(2)}`,
    }));

    const acceptanceRate = totalProposals > 0 ? Number(((acceptedProposals / totalProposals) * 100).toFixed(1)) : 0;

    return {
      userId,
      metrics: {
        profileViews: profileViewsCount,
        totalProposals,
        acceptedProposals,
        acceptanceRatePercentage: acceptanceRate,
        activeContracts,
        completedContracts,
        totalEarningsMinor,
        formattedTotalEarnings: `$${(totalEarningsMinor / 100).toFixed(2)}`,
        rating: userProfile?.profile?.rating || 5.0,
        reviewsCount: userProfile?.profile?.reviewsCount || 0,
      },
      earningsTimeSeries,
    };
  }

  async getClientAnalytics(userId: string) {
    const [
      projectsPosted,
      activeProjects,
      totalProposalsReceived,
      activeContracts,
      completedContracts,
      ledgerEntries,
    ] = await Promise.all([
      this.prisma.project.count({ where: { clientId: userId } }),
      this.prisma.project.count({ where: { clientId: userId, status: 'OPEN' } }),
      this.prisma.proposal.count({ where: { project: { clientId: userId } } }),
      this.prisma.contract.count({ where: { clientId: userId, status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { clientId: userId, status: 'COMPLETED' } }),
      this.prisma.ledgerEntry.findMany({
        where: { userId, type: 'CLIENT_PAYMENT', direction: 'DEBIT' },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    let totalSpendingMinor = 0;
    const monthlySpendingMap: Record<string, number> = {};

    for (const entry of ledgerEntries) {
      totalSpendingMinor += entry.amount;
      const monthKey = new Date(entry.createdAt).toISOString().slice(0, 7);
      monthlySpendingMap[monthKey] = (monthlySpendingMap[monthKey] || 0) + entry.amount;
    }

    const spendingTimeSeries = Object.entries(monthlySpendingMap).map(([month, amountMinor]) => ({
      month,
      amountMinor,
      formattedAmount: `$${(amountMinor / 100).toFixed(2)}`,
    }));

    const projectFillRate = projectsPosted > 0 ? Number((((activeContracts + completedContracts) / projectsPosted) * 100).toFixed(1)) : 0;

    return {
      userId,
      metrics: {
        projectsPosted,
        activeProjects,
        totalProposalsReceived,
        activeContracts,
        completedContracts,
        projectFillRatePercentage: projectFillRate,
        totalSpendingMinor,
        formattedTotalSpending: `$${(totalSpendingMinor / 100).toFixed(2)}`,
      },
      spendingTimeSeries,
    };
  }

  async getAdminAnalytics() {
    const [
      succeededPayments,
      platformFeeEntries,
      users,
      projects,
      contracts,
      totalSearches,
      zeroResultSearches,
    ] = await Promise.all([
      this.prisma.payment.findMany({ where: { status: 'SUCCEEDED' } }),
      this.prisma.ledgerEntry.findMany({ where: { type: 'FREELANCER_EARNING' } }),
      this.prisma.user.findMany({ select: { createdAt: true } }),
      this.prisma.project.findMany({ select: { createdAt: true, status: true } }),
      this.prisma.contract.findMany({ select: { status: true } }),
      this.prisma.analyticsEvent.count({ where: { eventType: 'SEARCH_PERFORMED' } }),
      this.prisma.analyticsEvent.count({
        where: {
          eventType: 'SEARCH_PERFORMED',
          metadata: { contains: '"total":0' },
        },
      }),
    ]);

    // Gross Marketplace Volume (GMV) from succeeded payments
    let gmvMinor = 0;
    for (const p of succeededPayments) gmvMinor += p.amount;

    // Platform Revenue (10% platform fee derived from Phase 7 fee metadata)
    let platformRevenueMinor = Math.floor((gmvMinor * 1000) / 10000);

    // User growth time-series
    const userGrowthMap: Record<string, number> = {};
    for (const u of users) {
      const monthKey = new Date(u.createdAt).toISOString().slice(0, 7);
      userGrowthMap[monthKey] = (userGrowthMap[monthKey] || 0) + 1;
    }

    const zeroResultSearchRate = totalSearches > 0 ? Number(((zeroResultSearches / totalSearches) * 100).toFixed(1)) : 0;

    return {
      metrics: {
        grossMarketplaceVolumeMinor: gmvMinor,
        formattedGMV: `$${(gmvMinor / 100).toFixed(2)}`,
        platformRevenueMinor,
        formattedPlatformRevenue: `$${(platformRevenueMinor / 100).toFixed(2)}`,
        totalUsers: users.length,
        totalProjects: projects.length,
        totalContracts: contracts.length,
        contractCompletionRate: contracts.length > 0 ? Number(((contracts.filter((c) => c.status === 'COMPLETED').length / contracts.length) * 100).toFixed(1)) : 0,
        zeroResultSearchRatePercentage: zeroResultSearchRate,
      },
      userGrowthTimeSeries: Object.entries(userGrowthMap).map(([month, count]) => ({ month, count })),
    };
  }

  async exportCsvReport(type: 'revenue' | 'users' | 'projects') {
    if (type === 'users') {
      const users = await this.prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
      });
      const header = 'ID,Name,Email,Role,Status,CreatedAt\n';
      const rows = users.map((u) => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.createdAt.toISOString()}"`).join('\n');
      return header + rows;
    } else if (type === 'projects') {
      const projects = await this.prisma.project.findMany({
        select: { id: true, title: true, budget: true, currency: true, status: true, createdAt: true },
      });
      const header = 'ID,Title,Budget,Currency,Status,CreatedAt\n';
      const rows = projects.map((p) => `"${p.id}","${p.title.replace(/"/g, '""')}",${p.budget},"${p.currency}","${p.status}","${p.createdAt.toISOString()}"`).join('\n');
      return header + rows;
    } else {
      const payments = await this.prisma.payment.findMany({
        where: { status: 'SUCCEEDED' },
        select: { id: true, amount: true, currency: true, status: true, createdAt: true },
      });
      const header = 'ID,AmountMinor,AmountUSD,Currency,Status,CreatedAt\n';
      const rows = payments.map((p) => `"${p.id}",${p.amount},${(p.amount / 100).toFixed(2)},"${p.currency}","${p.status}","${p.createdAt.toISOString()}"`).join('\n');
      return header + rows;
    }
  }
}
