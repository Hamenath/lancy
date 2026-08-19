import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { 
  RecommendFreelancersDto, 
  RecommendProjectsDto, 
  RecommendationFeedbackDto,
  UpdateWeightsDto 
} from './dto/recommendation.dto';

export interface ExplainableMatch {
  id: string;
  score: number;
  matchPercentage: number;
  explainabilityReason: string;
  signals: {
    skillOverlap: number;
    semanticScore: number;
    reputationScore: number;
    budgetCompatibility: number;
    freshnessScore: number;
    coldStartBoost: number;
  };
  item: any;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private prisma: PrismaService) {}

  private async getWeights() {
    let weight = await this.prisma.recommendationWeight.findFirst();
    if (!weight) {
      weight = await this.prisma.recommendationWeight.create({
        data: {
          skillWeight: 0.35,
          semanticWeight: 0.20,
          reputationWeight: 0.15,
          budgetWeight: 0.15,
          freshnessWeight: 0.10,
          coldStartWeight: 0.05,
        },
      });
    }
    return weight;
  }

  async recommendFreelancers(dto: RecommendFreelancersDto, actorId: string): Promise<ExplainableMatch[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found.`);
    }

    const weights = await this.getWeights();
    const freelancers = await this.prisma.freelancerProfile.findMany({
      include: {
        user: true,
      },
    });

    const projectSkills = project.skills
      ? project.skills.toLowerCase().split(',').map((s) => s.trim())
      : [];

    const matches: ExplainableMatch[] = freelancers.map((f) => {
      const fSkills = f.skills
        ? f.skills.toLowerCase().split(',').map((s) => s.trim())
        : [];

      // 1. Skill Overlap
      const sharedSkills = fSkills.filter((s) => projectSkills.includes(s));
      const skillOverlap = projectSkills.length > 0 ? sharedSkills.length / projectSkills.length : 0.5;

      // 2. Semantic Score (Simulated string similarity)
      const semanticScore = f.bio && f.bio.toLowerCase().includes(project.category.toLowerCase()) ? 0.9 : 0.6;

      // 3. Reputation
      const reputationScore = Math.min(1.0, f.rating / 5.0);

      // 4. Budget Compatibility
      const estTotalCost = f.hourlyRate * 40; // 40 hours standard estimate
      const budgetRatio = project.budget > 0 ? Math.min(1.0, project.budget / Math.max(1, estTotalCost)) : 0.8;

      // 5. Freshness
      const daysOld = (Date.now() - new Date(f.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessScore = Math.max(0.1, 1.0 - daysOld / 30);

      // 6. Cold-Start Boost
      const isNewFreelancer = f.reviewsCount < 2;
      const coldStartBoost = isNewFreelancer && f.isVerified ? 1.0 : 0.0;

      const finalScore =
        skillOverlap * weights.skillWeight +
        semanticScore * weights.semanticWeight +
        reputationScore * weights.reputationWeight +
        budgetRatio * weights.budgetWeight +
        freshnessScore * weights.freshnessWeight +
        coldStartBoost * weights.coldStartWeight;

      const matchPct = Math.round(Math.min(99, Math.max(50, finalScore * 100)));

      let reason = `${matchPct}% Match: `;
      if (sharedSkills.length > 0) {
        reason += `Strong alignment on ${sharedSkills.slice(0, 3).join(', ')}`;
      } else {
        reason += `High profile relevance in ${project.category}`;
      }
      if (reputationScore > 0.8) reason += ` + ${f.rating}★ Rating`;
      if (coldStartBoost > 0) reason += ` [Verified Rising Star]`;

      return {
        id: f.id,
        score: finalScore,
        matchPercentage: matchPct,
        explainabilityReason: reason,
        signals: {
          skillOverlap,
          semanticScore,
          reputationScore,
          budgetCompatibility: budgetRatio,
          freshnessScore,
          coldStartBoost,
        },
        item: f,
      };
    });

    matches.sort((a, b) => b.score - a.score);
    const limit = dto.limit || 5;
    const topMatches = matches.slice(0, limit);

    // Record SHOWN feedback asynchronously
    topMatches.forEach((m) => {
      this.recordFeedback({
        targetId: m.item.userId,
        recommendationType: 'FREELANCER',
        action: 'SHOWN',
      }, actorId).catch(() => {});
    });

    return topMatches;
  }

  async recommendProjects(dto: RecommendProjectsDto, actorId: string): Promise<ExplainableMatch[]> {
    const profile = await this.prisma.freelancerProfile.findUnique({
      where: { userId: dto.freelancerUserId },
    });

    if (!profile) {
      throw new NotFoundException(`Freelancer profile for user ${dto.freelancerUserId} not found.`);
    }

    const weights = await this.getWeights();
    const openProjects = await this.prisma.project.findMany({
      where: { status: 'OPEN' },
      include: { client: true },
    });

    const fSkills = profile.skills
      ? profile.skills.toLowerCase().split(',').map((s) => s.trim())
      : [];

    const matches: ExplainableMatch[] = openProjects.map((p) => {
      const pSkills = p.skills
        ? p.skills.toLowerCase().split(',').map((s) => s.trim())
        : [];

      const sharedSkills = pSkills.filter((s) => fSkills.includes(s));
      const skillOverlap = pSkills.length > 0 ? sharedSkills.length / pSkills.length : 0.5;

      const semanticScore = profile.title && p.title.toLowerCase().includes(profile.title.toLowerCase()) ? 0.95 : 0.65;
      const reputationScore = 0.85;

      const estCost = profile.hourlyRate * 40;
      const budgetRatio = p.budget > 0 ? Math.min(1.0, p.budget / Math.max(1, estCost)) : 0.8;

      const daysOld = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const freshnessScore = Math.max(0.1, 1.0 - daysOld / 14);

      const coldStartBoost = daysOld < 2 ? 1.0 : 0.0;

      const finalScore =
        skillOverlap * weights.skillWeight +
        semanticScore * weights.semanticWeight +
        reputationScore * weights.reputationWeight +
        budgetRatio * weights.budgetWeight +
        freshnessScore * weights.freshnessWeight +
        coldStartBoost * weights.coldStartWeight;

      const matchPct = Math.round(Math.min(99, Math.max(50, finalScore * 100)));

      let reason = `${matchPct}% Match: `;
      if (sharedSkills.length > 0) {
        reason += `Matches your skills in ${sharedSkills.slice(0, 3).join(', ')}`;
      } else {
        reason += `Fits your profile category ${p.category}`;
      }
      if (budgetRatio >= 0.9) reason += ` + Budget $${p.budget}`;

      return {
        id: p.id,
        score: finalScore,
        matchPercentage: matchPct,
        explainabilityReason: reason,
        signals: {
          skillOverlap,
          semanticScore,
          reputationScore,
          budgetCompatibility: budgetRatio,
          freshnessScore,
          coldStartBoost,
        },
        item: p,
      };
    });

    matches.sort((a, b) => b.score - a.score);
    const limit = dto.limit || 5;
    const topMatches = matches.slice(0, limit);

    topMatches.forEach((m) => {
      this.recordFeedback({
        targetId: m.item.id,
        recommendationType: 'PROJECT',
        action: 'SHOWN',
      }, actorId).catch(() => {});
    });

    return topMatches;
  }

  async recordFeedback(dto: RecommendationFeedbackDto, actorId: string) {
    return this.prisma.recommendationFeedback.create({
      data: {
        actorId,
        recommendationType: dto.recommendationType,
        targetId: dto.targetId,
        action: dto.action,
      },
    });
  }

  async getAnalytics() {
    const totalEvents = await this.prisma.recommendationFeedback.count();
    const shownCount = await this.prisma.recommendationFeedback.count({ where: { action: 'SHOWN' } });
    const clickedCount = await this.prisma.recommendationFeedback.count({ where: { action: 'CLICKED' } });
    const dismissedCount = await this.prisma.recommendationFeedback.count({ where: { action: 'DISMISSED' } });
    const appliedCount = await this.prisma.recommendationFeedback.count({ where: { action: 'APPLIED' } });

    const ctr = shownCount > 0 ? (clickedCount / shownCount) * 100 : 0;

    const weights = await this.getWeights();

    return {
      totalEvents,
      shownCount,
      clickedCount,
      dismissedCount,
      appliedCount,
      clickThroughRatePercentage: Math.round(ctr * 10) / 10,
      activeWeights: weights,
    };
  }

  async updateWeights(dto: UpdateWeightsDto) {
    const existing = await this.getWeights();
    return this.prisma.recommendationWeight.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
