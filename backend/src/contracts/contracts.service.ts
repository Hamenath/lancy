import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async getMyContracts(userId: string) {
    return this.prisma.contract.findMany({
      where: {
        OR: [
          { clientId: userId },
          { freelancerId: userId },
        ],
      },
      include: {
        project: true,
        client: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        project: true,
        proposal: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
            profile: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    const isClient = contract.clientId === userId;
    const isFreelancer = contract.freelancerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isClient && !isFreelancer && !isAdmin) {
      throw new ForbiddenException('You are not authorized to view this contract');
    }

    return contract;
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        project: true,
        client: true,
        freelancer: true,
        milestones: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
