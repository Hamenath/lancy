import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { 
  SearchProvider, 
  SearchFreelancersQuery, 
  SearchProjectsQuery, 
  PaginatedResult 
} from './search-provider.interface';

@Injectable()
export class PostgresSearchProvider implements SearchProvider {
  constructor(private prisma: PrismaService) {}

  async searchFreelancers(query: SearchFreelancersQuery): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'FREELANCER',
      status: 'ACTIVE',
      profile: { isNot: null },
    };

    const profileWhere: any = {};

    // 1. Keyword search (q)
    if (query.q) {
      const qLower = query.q.toLowerCase().trim();
      where.OR = [
        { name: { contains: qLower } },
        { profile: { title: { contains: qLower } } },
        { profile: { bio: { contains: qLower } } },
        { profile: { skills: { contains: qLower } } },
      ];
    }

    // 2. Skill filters
    if (query.skills && query.skills.length > 0) {
      profileWhere.AND = query.skills.map((skill) => ({
        skills: { contains: skill.trim() },
      }));
    }

    // 3. Location filter
    if (query.location) {
      profileWhere.location = { contains: query.location.trim() };
    }

    // 4. Rate filter
    if (query.minRate !== undefined || query.maxRate !== undefined) {
      profileWhere.hourlyRate = {};
      if (query.minRate !== undefined) profileWhere.hourlyRate.gte = query.minRate;
      if (query.maxRate !== undefined) profileWhere.hourlyRate.lte = query.maxRate;
    }

    // 5. Rating filter
    if (query.minRating !== undefined) {
      profileWhere.rating = { gte: query.minRating };
    }

    if (Object.keys(profileWhere).length > 0) {
      where.profile = { is: profileWhere };
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'rating') {
      orderBy = { profile: { rating: 'desc' } };
    } else if (query.sort === 'reviews') {
      orderBy = { profile: { reviewsCount: 'desc' } };
    } else if (query.sort === 'rate_asc') {
      orderBy = { profile: { hourlyRate: 'asc' } };
    } else if (query.sort === 'rate_desc') {
      orderBy = { profile: { hourlyRate: 'desc' } };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    // Format & Calculate Deterministic Relevance Scores
    const items = users.map((u) => {
      let relevanceScore = 0;
      if (query.q && u.name.toLowerCase().includes(query.q.toLowerCase())) relevanceScore += 50;
      if (query.q && u.profile?.title.toLowerCase().includes(query.q.toLowerCase())) relevanceScore += 40;
      if (u.profile?.rating) relevanceScore += u.profile.rating * 10;
      if (u.profile?.isVerified) relevanceScore += 15;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        photo: u.photo,
        title: u.profile?.title || 'Freelancer',
        bio: u.profile?.bio || '',
        hourlyRate: u.profile?.hourlyRate || 0,
        location: u.profile?.location || 'Remote',
        skills: u.profile?.skills ? u.profile.skills.split(',').map((s) => s.trim()) : [],
        rating: u.profile?.rating || 5.0,
        reviewsCount: u.profile?.reviewsCount || 0,
        isVerified: u.profile?.isVerified || false,
        relevanceScore,
      };
    });

    if (query.sort === 'relevance' || !query.sort) {
      items.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async searchProjects(query: SearchProjectsQuery): Promise<PaginatedResult<any>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'OPEN',
    };

    // 1. Keyword search (q)
    if (query.q) {
      const qLower = query.q.toLowerCase().trim();
      where.OR = [
        { title: { contains: qLower } },
        { description: { contains: qLower } },
        { skills: { contains: qLower } },
        { category: { contains: qLower } },
      ];
    }

    // 2. Skill filters
    if (query.skills && query.skills.length > 0) {
      where.AND = query.skills.map((skill) => ({
        skills: { contains: skill.trim() },
      }));
    }

    // 3. Budget filter
    if (query.minBudget !== undefined || query.maxBudget !== undefined) {
      where.budget = {};
      if (query.minBudget !== undefined) where.budget.gte = query.minBudget;
      if (query.maxBudget !== undefined) where.budget.lte = query.maxBudget;
    }

    // 4. Project Type & Experience filters
    if (query.projectType) where.projectType = query.projectType;
    if (query.experience) where.experienceLevel = query.experience;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'budget_asc') {
      orderBy = { budget: 'asc' };
    } else if (query.sort === 'budget_desc') {
      orderBy = { budget: 'desc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true, photo: true },
          },
          _count: {
            select: { proposals: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    const items = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      budget: p.budget,
      currency: p.currency,
      category: p.category,
      projectType: p.projectType,
      experienceLevel: p.experienceLevel,
      skills: p.skills ? p.skills.split(',').map((s) => s.trim()) : [],
      status: p.status,
      proposalsCount: p._count.proposals,
      clientId: p.clientId,
      clientName: p.client.name,
      clientPhoto: p.client.photo,
      createdAt: p.createdAt,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
