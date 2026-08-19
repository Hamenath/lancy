import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { 
  RecommendFreelancersDto, 
  RecommendProjectsDto, 
  RecommendationFeedbackDto,
  UpdateWeightsDto 
} from './dto/recommendation.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('recommendations')
@Controller('api/v1')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('recommendations/freelancers')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tailored freelancer recommendations for a project' })
  async getFreelanceRecommendations(
    @Body() dto: RecommendFreelancersDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recommendationsService.recommendFreelancers(dto, user.id);
  }

  @Post('recommendations/projects')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tailored project recommendations for a freelancer' })
  async getProjectRecommendations(
    @Body() dto: RecommendProjectsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recommendationsService.recommendProjects(dto, user.id);
  }

  @Post('recommendations/feedback')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record user interaction feedback with recommendations' })
  async recordFeedback(
    @Body() dto: RecommendationFeedbackDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.recommendationsService.recordFeedback(dto, user.id);
  }

  @Get('admin/recommendations/analytics')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommendation conversion analytics and CTR' })
  async getAnalytics() {
    return this.recommendationsService.getAnalytics();
  }

  @Patch('admin/recommendations/weights')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update recommendation signal weights' })
  async updateWeights(@Body() dto: UpdateWeightsDto) {
    return this.recommendationsService.updateWeights(dto);
  }
}
