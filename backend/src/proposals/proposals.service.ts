import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateProposalDto {
  freelancerId: string;
  bidAmount: number;
  coverLetter: string;
}

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async createProposal(projectId: string, dto: CreateProposalDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId: dto.freelancerId,
        bidAmount: dto.bidAmount,
        coverLetter: dto.coverLetter,
        status: 'PENDING',
      },
    });
  }

  async getProposalsForProject(projectId: string) {
    return this.prisma.proposal.findMany({
      where: { projectId },
      include: { freelancer: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
