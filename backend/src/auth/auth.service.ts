import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface SyncUserDto {
  email: string;
  name: string;
  photo?: string;
  role?: string;
  firebaseUid?: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUser(dto: SyncUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { firebaseUid: dto.firebaseUid },
        ]
      },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: dto.name || existing.name,
          photo: dto.photo || existing.photo,
          firebaseUid: dto.firebaseUid || existing.firebaseUid,
        },
        include: { profile: true },
      });
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        photo: dto.photo,
        role: dto.role || 'FREELANCER',
        firebaseUid: dto.firebaseUid,
        profile: {
          create: {
            title: 'Freelancer Specialist',
            bio: 'Welcome to my Lancy profile.',
            hourlyRate: 50,
            location: 'Remote',
            skills: 'Design, Development',
          },
        },
      },
      include: { profile: true },
    });
  }
}
