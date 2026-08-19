import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FreelancersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, skill?: string) {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      where: search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ]
      } : undefined,
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.profile?.title || 'Freelancer Professional',
      photo: u.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&radius=0`,
      bio: u.profile?.bio || '',
      skills: u.profile?.skills ? u.profile.skills.split(',').map((s) => s.trim()) : ['Figma', 'UI/UX'],
      rate: u.profile?.hourlyRate || 50,
      location: u.profile?.location || 'Remote',
      rating: u.profile?.rating || 5.0,
      reviewsCount: u.profile?.reviewsCount || 0,
      isVerified: u.profile?.isVerified || false,
    }));
  }

  async findOne(id: string) {
    const u = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!u) throw new NotFoundException('Freelancer not found');
    return {
      id: u.id,
      name: u.name,
      role: u.profile?.title || 'Freelancer Professional',
      photo: u.photo || '',
      bio: u.profile?.bio || '',
      skills: u.profile?.skills ? u.profile.skills.split(',').map((s) => s.trim()) : [],
      rate: u.profile?.hourlyRate || 0,
      location: u.profile?.location || 'Remote',
      rating: u.profile?.rating || 5.0,
      reviewsCount: u.profile?.reviewsCount || 0,
      isVerified: u.profile?.isVerified || false,
    };
  }
}
