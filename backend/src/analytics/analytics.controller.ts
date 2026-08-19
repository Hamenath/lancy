import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Res, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService, TrackEventDto } from './analytics.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('analytics')
@Controller('api/v1')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('analytics/events')
  @ApiOperation({ summary: 'Track lightweight user analytics event' })
  async trackEvent(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body() dto: TrackEventDto,
  ) {
    return this.analyticsService.trackEvent(user ? user.id : null, dto);
  }

  @Get('analytics/freelancer')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get freelancer metrics & earnings time-series (Session authorized)' })
  async getFreelancerAnalytics(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getFreelancerAnalytics(user.id);
  }

  @Get('analytics/client')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get client spending & hiring analytics (Session authorized)' })
  async getClientAnalytics(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getClientAnalytics(user.id);
  }

  @Get('admin/analytics/overview')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform GMV, Revenue & growth analytics (Admin only)' })
  async getAdminAnalytics() {
    return this.analyticsService.getAdminAnalytics();
  }

  @Get('admin/analytics/export')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export platform CSV analytics report (Admin only)' })
  async exportCsv(
    @Query('type') type: 'revenue' | 'users' | 'projects',
    @Res() res: Response,
  ) {
    const csvData = await this.analyticsService.exportCsvReport(type || 'revenue');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=lancy-${type || 'revenue'}-report.csv`);
    return res.status(200).send(csvData);
  }
}
