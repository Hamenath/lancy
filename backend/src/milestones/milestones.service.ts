import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateMilestoneDto {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
  order?: number;
}

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async createMilestone(contractId: string, userId: string, userRole: string, dto: CreateMilestoneDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { milestones: true },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    if (contract.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the project client can create contract milestones');
    }

    // Validate cumulative milestone amount
    const currentSum = contract.milestones.reduce((acc, m) => acc + m.amount, 0);
    if (currentSum + dto.amount > contract.agreedAmount) {
      throw new BadRequestException(
        `Total milestone amounts (${currentSum + dto.amount}) cannot exceed contract agreed amount (${contract.agreedAmount})`
      );
    }

    const maxOrder = contract.milestones.reduce((max, m) => Math.max(max, m.order), 0);

    return this.prisma.milestone.create({
      data: {
        contractId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        order: dto.order || maxOrder + 1,
        status: 'PENDING',
      },
    });
  }

  async getMilestones(contractId: string, userId: string, userRole: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    const isClient = contract.clientId === userId;
    const isFreelancer = contract.freelancerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isClient && !isFreelancer && !isAdmin) {
      throw new ForbiddenException('You are not authorized to view milestones for this contract');
    }

    return this.prisma.milestone.findMany({
      where: { contractId },
      orderBy: { order: 'asc' },
    });
  }

  async startMilestone(id: string, userId: string, userRole: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    if (milestone.contract.freelancerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the assigned freelancer can start this milestone');
    }

    if (!['PENDING', 'CHANGES_REQUESTED'].includes(milestone.status)) {
      throw new BadRequestException(`Cannot start milestone with status ${milestone.status}`);
    }

    return this.prisma.milestone.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async submitMilestone(id: string, userId: string, userRole: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    if (milestone.contract.freelancerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the assigned freelancer can submit this milestone');
    }

    if (milestone.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`Cannot submit milestone with status ${milestone.status}`);
    }

    return this.prisma.milestone.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });
  }

  async requestChanges(id: string, userId: string, userRole: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Reason for change request cannot be empty');
    }

    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    if (milestone.contract.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the client can request milestone changes');
    }

    if (milestone.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cannot request changes for milestone with status ${milestone.status}`);
    }

    return this.prisma.milestone.update({
      where: { id },
      data: {
        status: 'CHANGES_REQUESTED',
        changeReason: reason,
      },
    });
  }

  /**
   * Client approves milestone.
   * If ALL milestones for the contract are now APPROVED,
   * automatically marks Contract and Project as COMPLETED inside a Prisma transaction.
   */
  async approveMilestone(id: string, userId: string, userRole: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            milestones: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    if (milestone.contract.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the client can approve this milestone');
    }

    if (milestone.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cannot approve milestone with status ${milestone.status}`);
    }

    const approvedAt = new Date();

    // Check if approving this milestone means ALL contract milestones are approved
    const otherMilestones = milestone.contract.milestones.filter((m) => m.id !== id);
    const allOthersApproved = otherMilestones.length > 0 && otherMilestones.every((m) => m.status === 'APPROVED');

    if (allOthersApproved) {
      // Atomic completion transaction
      const [approvedM] = await this.prisma.$transaction([
        this.prisma.milestone.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedAt,
          },
        }),
        this.prisma.contract.update({
          where: { id: milestone.contractId },
          data: { status: 'COMPLETED' },
        }),
        this.prisma.project.update({
          where: { id: milestone.contract.projectId },
          data: { status: 'COMPLETED' },
        }),
      ]);
      return approvedM;
    }

    return this.prisma.milestone.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt,
      },
    });
  }
}
