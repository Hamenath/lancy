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
import { ProposalsService, CreateProposalDto, UpdateProposalDto } from './proposals.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('proposals')
@Controller('api/v1')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post('projects/:id/proposals')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('FREELANCER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a proposal bid for a project (Freelancer/Admin only)' })
  async createProposal(
    @Param('id') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalsService.createProposal(projectId, user.id, dto);
  }

  @Get('projects/:id/proposals')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all proposal bids for a project (Project owner/Admin only)' })
  async getProposalsForProject(
    @Param('id') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.getProposalsForProject(projectId, user.id, user.role);
  }

  @Get('proposals/me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submitted proposals for authenticated freelancer' })
  async getMyProposals(@CurrentUser() user: AuthenticatedUser) {
    return this.proposalsService.getProposalsForFreelancer(user.id);
  }

  @Get('proposals/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get proposal details by ID (Owner/Project Owner/Admin)' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.findOne(id, user.id, user.role);
  }

  @Patch('proposals/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update proposal bid while PENDING (Owner/Admin only)' })
  async updateProposal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProposalDto,
  ) {
    return this.proposalsService.updateProposal(id, user.id, user.role, dto);
  }

  @Post('proposals/:id/withdraw')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw proposal bid (Owner/Admin only)' })
  async withdrawProposal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.withdrawProposal(id, user.id, user.role);
  }

  @Post('proposals/:id/shortlist')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shortlist proposal (Project owner/Admin only)' })
  async shortlistProposal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.shortlistProposal(id, user.id, user.role);
  }

  @Post('proposals/:id/reject')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject proposal (Project owner/Admin only)' })
  async rejectProposal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.rejectProposal(id, user.id, user.role);
  }

  @Post('proposals/:id/accept')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept proposal & start project (Atomic Transaction, Project owner/Admin only)' })
  async acceptProposal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.proposalsService.acceptProposal(id, user.id, user.role);
  }
}
