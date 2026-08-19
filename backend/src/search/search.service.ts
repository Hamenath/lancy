import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PostgresSearchProvider } from './providers/postgres-search.provider';
import { SearchFreelancersQuery, SearchProjectsQuery } from './providers/search-provider.interface';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaService,
    private searchProvider: PostgresSearchProvider,
  ) {}

  private normalizeString(input?: string): string | undefined {
    if (!input) return undefined;
    const trimmed = input.trim().replace(/\s+/g, ' ');
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private normalizeArray(input?: any): string[] | undefined {
    if (!input) return undefined;
    if (Array.isArray(input)) {
      return input.map((i) => String(i).trim()).filter((i) => i.length > 0);
    }
    if (typeof input === 'string') {
      return input.split(',').map((i) => i.trim()).filter((i) => i.length > 0);
    }
    return undefined;
  }

  async searchFreelancers(rawQuery: SearchFreelancersQuery) {
    const query: SearchFreelancersQuery = {
      q: this.normalizeString(rawQuery.q),
      skills: this.normalizeArray(rawQuery.skills),
      location: this.normalizeString(rawQuery.location),
      minRate: rawQuery.minRate ? Number(rawQuery.minRate) : undefined,
      maxRate: rawQuery.maxRate ? Number(rawQuery.maxRate) : undefined,
      minRating: rawQuery.minRating ? Number(rawQuery.minRating) : undefined,
      availability: this.normalizeString(rawQuery.availability),
      experience: this.normalizeString(rawQuery.experience),
      page: rawQuery.page ? Number(rawQuery.page) : 1,
      limit: rawQuery.limit ? Number(rawQuery.limit) : 12,
      sort: rawQuery.sort || 'relevance',
    };

    return this.searchProvider.searchFreelancers(query);
  }

  async searchProjects(rawQuery: SearchProjectsQuery) {
    const query: SearchProjectsQuery = {
      q: this.normalizeString(rawQuery.q),
      skills: this.normalizeArray(rawQuery.skills),
      minBudget: rawQuery.minBudget ? Number(rawQuery.minBudget) : undefined,
      maxBudget: rawQuery.maxBudget ? Number(rawQuery.maxBudget) : undefined,
      projectType: this.normalizeString(rawQuery.projectType),
      experience: this.normalizeString(rawQuery.experience),
      page: rawQuery.page ? Number(rawQuery.page) : 1,
      limit: rawQuery.limit ? Number(rawQuery.limit) : 12,
      sort: rawQuery.sort || 'relevance',
    };

    return this.searchProvider.searchProjects(query);
  }

  async getPopularSkills() {
    const profiles = await this.prisma.freelancerProfile.findMany({
      select: { skills: true },
    });

    const skillCounts: Record<string, number> = {};
    for (const p of profiles) {
      if (p.skills) {
        const skillsList = p.skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
        for (const s of skillsList) {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        }
      }
    }

    const sortedSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    return sortedSkills.length > 0 ? sortedSkills : [
      { skill: 'React', count: 12 },
      { skill: 'TypeScript', count: 10 },
      { skill: 'Node.js', count: 8 },
      { skill: 'Figma', count: 7 },
      { skill: 'UI/UX', count: 6 },
    ];
  }

  async getFeaturedProjects() {
    return this.prisma.project.findMany({
      where: { status: 'OPEN' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, photo: true } },
      },
    });
  }
}
