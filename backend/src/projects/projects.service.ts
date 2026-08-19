import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface CreateProjectDto {
  title: string;
  description: string;
  budget?: number;
  category?: string;
  imageUrl?: string;
  clientId: string;
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
        category: dto.category || 'General',
        imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1541462608141-2ffb68df685e?auto=format&fit=crop&q=80&w=500',
        clientId: dto.clientId,
      },
    });
  }

  async findAll(category?: string) {
    return this.prisma.project.findMany({
      where: category ? { category } : undefined,
      include: { client: true, proposals: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { client: true, proposals: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
