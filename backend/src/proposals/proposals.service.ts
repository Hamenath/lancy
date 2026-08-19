import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  ConflictException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateProposalDto {
  bidAmount: number;
  proposedBudget?: number;
  estimatedDays?: number;
  coverLetter: string;
}

export interface UpdateProposalDto {
  bidAmount?: number;
  estimatedDays?: number;
  coverLetter?: string;
}

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createProposal(projectId: string, freelancerId: string, dto: CreateProposalDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== 'OPEN') {
      throw new BadRequestException(`Cannot submit proposal for project with status ${project.status}`);
    }

    const existing = await this.prisma.proposal.findFirst({
      where: {
        projectId,
        freelancerId,
        status: { in: ['PENDING', 'SHORTLISTED', 'ACCEPTED'] },
      },
    });

    if (existing) {
      throw new ConflictException('You have already submitted an active proposal for this project');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId,
        bidAmount: dto.bidAmount,
        proposedBudget: dto.proposedBudget || dto.bidAmount,
        estimatedDays: dto.estimatedDays || 7,
        coverLetter: dto.coverLetter,
        status: 'PENDING',
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            photo: true,
            profile: true,
          },
        },
      },
    });

    // Notify project client
    await this.notificationsService.createNotification({
      userId: project.clientId,
      type: 'PROPOSAL_RECEIVED',
      title: 'New proposal received',
      message: `${proposal.freelancer.name} submitted a proposal for "${project.title}"`,
      metadata: { projectId, proposalId: proposal.id },
    });

    return proposal;
  }

  async getProposalsForProject(projectId: string, userId: string, userRole: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the project owner can view project proposals');
    }

    return this.prisma.proposal.findMany({
      where: { projectId },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            photo: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProposalsForFreelancer(freelancerId: string) {
    return this.prisma.proposal.findMany({
      where: { freelancerId },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                photo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        project: true,
        freelancer: {
          select: {
            id: true,
            name: true,
            photo: true,
            profile: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    const isFreelancerOwner = proposal.freelancerId === userId;
    const isProjectOwner = proposal.project.clientId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isFreelancerOwner && !isProjectOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to view this proposal');
    }

    return proposal;
  }

  async updateProposal(id: string, userId: string, userRole: string, dto: UpdateProposalDto) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    if (proposal.freelancerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to update this proposal');
    }

    if (proposal.status !== 'PENDING') {
      throw new BadRequestException(`Cannot update proposal with status ${proposal.status}`);
    }

    return this.prisma.proposal.update({
      where: { id },
      data: {
        bidAmount: dto.bidAmount ?? proposal.bidAmount,
        estimatedDays: dto.estimatedDays ?? proposal.estimatedDays,
        coverLetter: dto.coverLetter ?? proposal.coverLetter,
      },
    });
  }

  async withdrawProposal(id: string, userId: string, userRole: string) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    if (proposal.freelancerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to withdraw this proposal');
    }

    if (!['PENDING', 'SHORTLISTED'].includes(proposal.status)) {
      throw new BadRequestException(`Cannot withdraw proposal with status ${proposal.status}`);
    }

    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });
  }

  async shortlistProposal(id: string, userId: string, userRole: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    if (proposal.project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the project owner can shortlist proposals');
    }

    return this.prisma.proposal.update({
      where: { id },
      data: { status: 'SHORTLISTED' },
    });
  }

  async rejectProposal(id: string, userId: string, userRole: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    if (proposal.project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the project owner can reject proposals');
    }

    const updated = await this.prisma.proposal.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await this.notificationsService.createNotification({
      userId: proposal.freelancerId,
      type: 'PROPOSAL_REJECTED',
      title: 'Proposal Status Update',
      message: `Your proposal for "${proposal.project.title}" was not selected.`,
      metadata: { projectId: proposal.projectId, proposalId: id },
    });

    return updated;
  }

  async acceptProposal(id: string, userId: string, userRole: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    if (proposal.project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the project owner can accept proposals');
    }

    if (proposal.project.status !== 'OPEN') {
      throw new BadRequestException(`Cannot accept proposal for project in ${proposal.project.status} state`);
    }

    const existingContract = await this.prisma.contract.findUnique({
      where: { projectId: proposal.projectId },
    });
    if (existingContract) {
      throw new ConflictException('A contract already exists for this project');
    }

    const [acceptedProposal, updatedProject, updatedProposals, contract] = await this.prisma.$transaction([
      this.prisma.proposal.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.project.update({
        where: { id: proposal.projectId },
        data: { status: 'IN_PROGRESS' },
      }),
      this.prisma.proposal.updateMany({
        where: {
          projectId: proposal.projectId,
          id: { not: id },
          status: { in: ['PENDING', 'SHORTLISTED'] },
        },
        data: { status: 'REJECTED' },
      }),
      this.prisma.contract.create({
        data: {
          projectId: proposal.projectId,
          proposalId: proposal.id,
          clientId: proposal.project.clientId,
          freelancerId: proposal.freelancerId,
          title: proposal.project.title,
          description: proposal.project.description,
          agreedAmount: proposal.proposedBudget || proposal.bidAmount,
          currency: proposal.project.currency || 'USD',
          status: 'ACTIVE',
        },
      }),
    ]);

    // Notify freelancer
    await this.notificationsService.createNotification({
      userId: proposal.freelancerId,
      type: 'PROPOSAL_ACCEPTED',
      title: 'Congratulations! Proposal Accepted',
      message: `Your proposal for "${proposal.project.title}" has been accepted! A contract has been created.`,
      metadata: { projectId: proposal.projectId, contractId: contract.id },
    });

    return {
      proposal: acceptedProposal,
      contract,
    };
  }
}
