import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateReviewDto {
  rating: number;
  communicationRating?: number;
  qualityRating?: number;
  professionalismRating?: number;
  comment: string;
}

export interface ReportReviewDto {
  reason: string;
  description?: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createReview(contractId: string, userId: string, dto: CreateReviewDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    if (contract.status !== 'COMPLETED') {
      throw new BadRequestException(`Reviews can only be submitted for COMPLETED contracts. Current status: ${contract.status}`);
    }

    const isClient = contract.clientId === userId;
    const isFreelancer = contract.freelancerId === userId;

    if (!isClient && !isFreelancer) {
      throw new ForbiddenException('Only contract participants can submit a review');
    }

    const revieweeId = isClient ? contract.freelancerId : contract.clientId;

    if (userId === revieweeId) {
      throw new BadRequestException('You cannot review yourself');
    }

    // Validate 1-5 integer ratings
    const validateRating = (val: number, name: string) => {
      if (!Number.isInteger(val) || val < 1 || val > 5) {
        throw new BadRequestException(`${name} must be an integer between 1 and 5`);
      }
    };

    validateRating(dto.rating, 'Overall rating');
    if (dto.communicationRating) validateRating(dto.communicationRating, 'Communication rating');
    if (dto.qualityRating) validateRating(dto.qualityRating, 'Quality rating');
    if (dto.professionalismRating) validateRating(dto.professionalismRating, 'Professionalism rating');

    if (!dto.comment || dto.comment.trim().length === 0) {
      throw new BadRequestException('Review comment cannot be empty');
    }

    // Check duplicate review
    const existing = await this.prisma.review.findUnique({
      where: {
        contractId_reviewerId: {
          contractId,
          reviewerId: userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already submitted a review for this contract');
    }

    const review = await this.prisma.review.create({
      data: {
        contractId,
        reviewerId: userId,
        revieweeId,
        rating: dto.rating,
        communicationRating: dto.communicationRating || 5,
        qualityRating: dto.qualityRating || 5,
        professionalismRating: dto.professionalismRating || 5,
        comment: dto.comment.trim(),
        status: 'PUBLISHED',
        verified: true,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, photo: true },
        },
      },
    });

    // Push notification to reviewee
    await this.notificationsService.createNotification({
      userId: revieweeId,
      type: 'NEW_REVIEW',
      title: 'New Review Received',
      message: `${review.reviewer.name} left you a ${dto.rating}-star review for "${contract.title}"`,
      metadata: { contractId, reviewId: review.id },
    });

    return review;
  }

  async getContractReviews(contractId: string) {
    return this.prisma.review.findMany({
      where: { contractId },
      include: {
        reviewer: {
          select: { id: true, name: true, photo: true },
        },
        reviewee: {
          select: { id: true, name: true, photo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: {
        revieweeId: userId,
        status: 'PUBLISHED',
      },
      include: {
        reviewer: {
          select: { id: true, name: true, photo: true },
        },
        contract: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReputation(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        revieweeId: userId,
        status: 'PUBLISHED',
      },
    });

    const completedContractsCount = await this.prisma.contract.count({
      where: {
        OR: [
          { clientId: userId },
          { freelancerId: userId },
        ],
        status: 'COMPLETED',
      },
    });

    if (reviews.length === 0) {
      return {
        userId,
        averageRating: 5.0,
        formattedAverageRating: '5.0',
        totalReviews: 0,
        completedContractsCount,
        categoryAverages: {
          communication: 5.0,
          quality: 5.0,
          professionalism: 5.0,
        },
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    let sumRating = 0;
    let sumComm = 0;
    let sumQual = 0;
    let sumProf = 0;
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    for (const r of reviews) {
      sumRating += r.rating;
      sumComm += r.communicationRating;
      sumQual += r.qualityRating;
      sumProf += r.professionalismRating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    const count = reviews.length;
    const avgRating = sumRating / count;

    return {
      userId,
      averageRating: avgRating,
      formattedAverageRating: avgRating.toFixed(1),
      totalReviews: count,
      completedContractsCount,
      categoryAverages: {
        communication: Number((sumComm / count).toFixed(1)),
        quality: Number((sumQual / count).toFixed(1)),
        professionalism: Number((sumProf / count).toFixed(1)),
      },
      distribution,
    };
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: { select: { id: true, name: true, photo: true } },
        reviewee: { select: { id: true, name: true, photo: true } },
        contract: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async updateReview(id: string, userId: string, dto: Partial<CreateReviewDto>) {
    const review = await this.findOne(id);

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Only the original reviewer can edit this review');
    }

    // 7-day edit window check
    const diffMs = Date.now() - new Date(review.createdAt).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      throw new BadRequestException('The 7-day review editing window has passed');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating ?? review.rating,
        comment: dto.comment ? dto.comment.trim() : review.comment,
        communicationRating: dto.communicationRating ?? review.communicationRating,
        qualityRating: dto.qualityRating ?? review.qualityRating,
        professionalismRating: dto.professionalismRating ?? review.professionalismRating,
      },
    });
  }

  async reportReview(id: string, userId: string, dto: ReportReviewDto) {
    await this.findOne(id);

    const existing = await this.prisma.reviewReport.findUnique({
      where: {
        reviewId_reporterId: {
          reviewId: id,
          reporterId: userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already reported this review');
    }

    return this.prisma.reviewReport.create({
      data: {
        reviewId: id,
        reporterId: userId,
        reason: dto.reason,
        description: dto.description,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: { status },
    });
  }
}
