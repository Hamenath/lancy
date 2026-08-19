import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AIProvider } from './providers/ai-provider.interface';
import { MockAIProvider } from './providers/mock-ai.provider';
import { GeminiAIProvider } from './providers/gemini-ai.provider';

@Injectable()
export class AiService {
  private logger = new Logger(AiService.name);
  private provider: AIProvider;

  constructor(private prisma: PrismaService) {
    const providerName = (process.env.AI_PROVIDER || 'MOCK').toUpperCase();
    if (providerName === 'GEMINI') {
      this.provider = new GeminiAIProvider();
    } else {
      this.provider = new MockAIProvider();
    }
  }

  private async logUsage(
    actorId: string | null,
    operation: string,
    startTime: number,
    status = 'SUCCESS'
  ) {
    const latencyMs = Date.now() - startTime;
    try {
      await this.prisma.aiUsageLog.create({
        data: {
          actorId: actorId || undefined,
          provider: this.provider.name,
          model: process.env.AI_MODEL || 'gemini-1.5-flash',
          operation,
          inputTokens: 150,
          outputTokens: 250,
          estimatedCostMinor: 1, // $0.0001
          latencyMs,
          status,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to record AI usage log: ${err}`);
    }
  }

  async extractSkills(actorId: string | null, text: string) {
    const startTime = Date.now();
    try {
      const result = await this.provider.extractSkills(text);
      await this.logUsage(actorId, 'SKILL_EXTRACTION', startTime);
      return result;
    } catch (err) {
      await this.logUsage(actorId, 'SKILL_EXTRACTION', startTime, 'ERROR');
      throw err;
    }
  }

  async improveProject(actorId: string | null, title: string, description: string) {
    const startTime = Date.now();
    try {
      const result = await this.provider.improveProject(title, description);
      await this.logUsage(actorId, 'PROJECT_IMPROVE', startTime);
      return result;
    } catch (err) {
      await this.logUsage(actorId, 'PROJECT_IMPROVE', startTime, 'ERROR');
      throw err;
    }
  }

  async improveProfile(actorId: string | null, headline: string, bio: string, skills: string[]) {
    const startTime = Date.now();
    try {
      const result = await this.provider.improveProfile(headline, bio, skills);
      await this.logUsage(actorId, 'PROFILE_IMPROVE', startTime);
      return result;
    } catch (err) {
      await this.logUsage(actorId, 'PROFILE_IMPROVE', startTime, 'ERROR');
      throw err;
    }
  }

  async improveProposal(actorId: string, projectId: string, coverLetter: string) {
    const startTime = Date.now();
    try {
      const [project, user] = await Promise.all([
        this.prisma.project.findUnique({ where: { id: projectId } }),
        this.prisma.user.findUnique({
          where: { id: actorId },
          include: { profile: true },
        }),
      ]);

      const projectDesc = project ? `${project.title}: ${project.description}` : 'General Project';
      const userSkills = user?.profile?.skills ? user.profile.skills.split(',').map((s) => s.trim()) : [];
      const userBio = user?.profile?.bio || undefined;

      const result = await this.provider.improveProposal(projectDesc, coverLetter, userBio, userSkills);
      await this.logUsage(actorId, 'PROPOSAL_ASSIST', startTime);
      return result;
    } catch (err) {
      await this.logUsage(actorId, 'PROPOSAL_ASSIST', startTime, 'ERROR');
      throw err;
    }
  }

  async matchFreelancersForProject(projectId: string) {
    const startTime = Date.now();
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) return [];

      const projectSkills = project.skills ? project.skills.toLowerCase().split(',').map((s) => s.trim()) : [];

      const freelancers = await this.prisma.user.findMany({
        where: { role: 'FREELANCER', status: 'ACTIVE' },
        include: { profile: true },
        take: 20,
      });

      const matches = freelancers.map((f) => {
        const freelancerSkills = f.profile?.skills ? f.profile.skills.toLowerCase().split(',').map((s) => s.trim()) : [];
        const matching = freelancerSkills.filter((s) => projectSkills.includes(s));
        const missing = projectSkills.filter((s) => !freelancerSkills.includes(s));

        let score = 0.5;
        if (projectSkills.length > 0) {
          score = Number((0.4 + (matching.length / projectSkills.length) * 0.5 + ((f.profile?.rating || 5) / 5) * 0.1).toFixed(2));
        }

        return {
          freelancerId: f.id,
          name: f.name,
          photo: f.photo,
          title: f.profile?.title || 'Freelancer',
          rating: f.profile?.rating || 5.0,
          hourlyRate: f.profile?.hourlyRate || 0,
          matchScore: Math.min(0.99, score),
          matchingSkills: matching.map((s) => s.toUpperCase()),
          missingSkills: missing.map((s) => s.toUpperCase()),
          reason: `Strong alignment on ${matching.join(', ') || 'core skills'} with a verified rating of ${f.profile?.rating || 5.0}★.`,
        };
      });

      matches.sort((a, b) => b.matchScore - a.matchScore);
      await this.logUsage(null, 'MATCHING', startTime);
      return matches.slice(0, 10);
    } catch (err) {
      await this.logUsage(null, 'MATCHING', startTime, 'ERROR');
      return [];
    }
  }

  async recommendProjectsForFreelancer(userId: string) {
    const startTime = Date.now();
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      const userSkills = user?.profile?.skills ? user.profile.skills.toLowerCase().split(',').map((s) => s.trim()) : [];

      const projects = await this.prisma.project.findMany({
        where: { status: 'OPEN' },
        include: { client: { select: { name: true } } },
        take: 20,
      });

      const recommendations = projects.map((p) => {
        const pSkills = p.skills ? p.skills.toLowerCase().split(',').map((s) => s.trim()) : [];
        const matching = pSkills.filter((s) => userSkills.includes(s));

        let score = 0.6;
        if (pSkills.length > 0) {
          score = Number((0.5 + (matching.length / pSkills.length) * 0.4).toFixed(2));
        }

        return {
          projectId: p.id,
          title: p.title,
          description: p.description,
          budget: p.budget,
          currency: p.currency,
          clientName: p.client?.name || 'Client',
          matchScore: Math.min(0.98, score),
          matchingSkills: matching.map((s) => s.toUpperCase()),
          reason: `Recommended project matching your verified skill set in ${matching.join(', ') || 'software development'}.`,
        };
      });

      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      await this.logUsage(userId, 'MATCHING', startTime);
      return recommendations.slice(0, 10);
    } catch (err) {
      await this.logUsage(userId, 'MATCHING', startTime, 'ERROR');
      return [];
    }
  }

  async chatAssistant(actorId: string | null, prompt: string) {
    const startTime = Date.now();
    try {
      const response = await this.provider.chat(prompt);
      await this.logUsage(actorId, 'ASSISTANT', startTime);
      return { response };
    } catch (err) {
      await this.logUsage(actorId, 'ASSISTANT', startTime, 'ERROR');
      return { response: 'Lancy AI Assistant is currently operating in offline mode. How else can I help you today?' };
    }
  }
}
