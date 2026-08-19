import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService, CreateMilestoneDto } from './milestones.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('milestones')
@Controller('api/v1')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post('contracts/:contractId/milestones')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('CLIENT', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a milestone for contract (Client/Admin only)' })
  async createMilestone(
    @Param('contractId') contractId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.milestonesService.createMilestone(contractId, user.id, user.role, dto);
  }

  @Get('contracts/:contractId/milestones')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get milestones for contract' })
  async getMilestones(
    @Param('contractId') contractId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.milestonesService.getMilestones(contractId, user.id, user.role);
  }

  @Post('milestones/:id/start')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start milestone work (Freelancer only)' })
  async startMilestone(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.milestonesService.startMilestone(id, user.id, user.role);
  }

  @Post('milestones/:id/submit')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit completed milestone work (Freelancer only)' })
  async submitMilestone(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.milestonesService.submitMilestone(id, user.id, user.role);
  }

  @Post('milestones/:id/request-changes')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request changes on submitted milestone (Client only)' })
  async requestChanges(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason: string,
  ) {
    return this.milestonesService.requestChanges(id, user.id, user.role, reason);
  }

  @Post('milestones/:id/approve')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve submitted milestone (Client only)' })
  async approveMilestone(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.milestonesService.approveMilestone(id, user.id, user.role);
  }
}
