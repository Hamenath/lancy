import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateProjectDto {
  title: string;
  description: string;
  budget?: number;
  currency?: string;
  category?: string;
  projectType?: string;
  experienceLevel?: string;
  skills?: string;
  deadline?: string;
  imageUrl?: string;
  clientId: string;
}

export interface ProjectQueryDto {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  projectType?: string;
  experienceLevel?: string;
  search?: string;
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        budget: dto.budget || 0,
        currency: dto.currency || 'USD',
        category: dto.category || 'General',
        projectType: dto.projectType || 'FIXED_PRICE',
        experienceLevel: dto.experienceLevel || 'INTERMEDIATE',
        skills: dto.skills || '',
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&q=80&w=500',
        status: 'OPEN',
        clientId: dto.clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
  }

  async findAll(query: ProjectQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    } else {
      // Default to OPEN projects for public discovery
      where.status = 'OPEN';
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.projectType) {
      where.projectType = query.projectType;
    }

    if (query.experienceLevel) {
      where.experienceLevel = query.experienceLevel;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { skills: { contains: query.search } },
      ];
    }

    const [total, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              photo: true,
            },
          },
          _count: {
            select: { proposals: true },
          },
        },
      }),
    ]);

    return {
      data: projects.map((p) => ({
        ...p,
        proposalsCount: p._count.proposals,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
        _count: {
          select: { proposals: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      ...project,
      proposalsCount: project._count.proposals,
    };
  }

  async update(id: string, userId: string, userRole: string, dto: Partial<CreateProjectDto>) {
    const project = await this.findOne(id);
    if (project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to edit this project');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title ?? project.title,
        description: dto.description ?? project.description,
        budget: dto.budget ?? project.budget,
        category: dto.category ?? project.category,
        projectType: dto.projectType ?? project.projectType,
        experienceLevel: dto.experienceLevel ?? project.experienceLevel,
        skills: dto.skills ?? project.skills,
        imageUrl: dto.imageUrl ?? project.imageUrl,
      },
    });
  }

  async publish(id: string, userId: string, userRole: string) {
    const project = await this.findOne(id);
    if (project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to publish this project');
    }

    return this.prisma.project.update({
      where: { id },
      data: { status: 'OPEN' },
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const project = await this.findOne(id);
    if (project.clientId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not authorized to delete this project');
    }

    return this.prisma.project.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
