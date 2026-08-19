import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService, CreateReviewDto, ReportReviewDto } from './reviews.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('api/v1')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('contracts/:contractId/reviews')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a verified review for a COMPLETED contract' })
  async createReview(
    @Param('contractId') contractId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(contractId, user.id, dto);
  }

  @Get('contracts/:contractId/reviews')
  @ApiOperation({ summary: 'Get participant reviews for a contract' })
  async getContractReviews(@Param('contractId') contractId: string) {
    return this.reviewsService.getContractReviews(contractId);
  }

  @Get('users/:userId/reviews')
  @ApiOperation({ summary: 'Get published verified reviews for target user' })
  async getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getUserReviews(userId);
  }

  @Get('users/:userId/reputation')
  @ApiOperation({ summary: 'Get aggregated reputation summary & 1-5 star distribution for target user' })
  async getUserReputation(@Param('userId') userId: string) {
    return this.reviewsService.getUserReputation(userId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get review detail by ID' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch('reviews/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update review (Reviewer edit within 7 days of creation)' })
  async updateReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Partial<CreateReviewDto>,
  ) {
    return this.reviewsService.updateReview(id, user.id, dto);
  }

  @Post('reviews/:id/report')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report review for moderation' })
  async reportReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.reportReview(id, user.id, dto);
  }

  @Patch('admin/reviews/:id/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate review visibility status (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.reviewsService.updateStatus(id, status);
  }
}
