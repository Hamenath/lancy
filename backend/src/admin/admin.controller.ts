import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DisputesService, OpenDisputeDto, ResolveDisputeDto } from './disputes.service';
import { AuditLogService } from './audit-log.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('api/v1')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly disputesService: DisputesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // ----------------------------------------------------
  // PUBLIC / PARTICIPANT DISPUTE & REPORT ACTION ENDPOINTS
  // ----------------------------------------------------

  @Post('projects/:id/report')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit project report' })
  async reportProject(
    @Param('id') projectId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason: string,
    @Body('description') description?: string,
  ) {
    return this.adminService.createProjectReport(user.id, projectId, reason, description);
  }

  @Post('contracts/:id/disputes')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open dispute on a contract (Contract participants only)' })
  async openDispute(
    @Param('id') contractId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.disputesService.openDispute(contractId, user.id, dto);
  }

  @Get('disputes/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dispute details (Contract participants & Admins only)' })
  async getDispute(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.disputesService.getDisputeById(id, user.id, user.role);
  }

  // ----------------------------------------------------
  // PRIVILEGED ADMIN ONLY ENDPOINTS (@Roles('ADMIN'))
  // ----------------------------------------------------

  @Get('admin/dashboard/stats')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real platform aggregated metrics (Admin only)' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('admin/users')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated users list with search & status filters (Admin only)' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.adminService.getUsers(page, limit, role, status, q);
  }

  @Get('admin/users/:id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user detailed profile & audit view (Admin only)' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('admin/users/:id/suspend')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend user account with reason (Admin only)' })
  async suspendUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('reason') reason: string,
  ) {
    return this.adminService.suspendUser(user.id, id, reason || 'Administrative suspension');
  }

  @Post('admin/users/:id/restore')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore suspended user account (Admin only)' })
  async restoreUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.restoreUser(user.id, id);
  }

  @Get('admin/projects')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects moderation list (Admin only)' })
  async getProjects(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getProjects(page, limit, status);
  }

  @Patch('admin/projects/:id/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate project status (Admin only)' })
  async moderateProject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('status') status: string,
  ) {
    return this.adminService.moderateProject(user.id, id, status);
  }

  @Get('admin/reports')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get marketplace reports list (Admin only)' })
  async getReports() {
    return this.adminService.getReports();
  }

  @Get('admin/disputes')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get disputes list (Admin only)' })
  async getAllDisputes(@Query('status') status?: string) {
    return this.disputesService.getAllDisputes(status);
  }

  @Post('admin/disputes/:id/resolve')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resolve contract dispute (Admin only)' })
  async resolveDispute(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolveDispute(id, user.id, dto);
  }

  @Get('admin/payments')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read-only payment monitoring list (Admin only)' })
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Get('admin/audit-logs')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated append-only audit logs (Admin only)' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogService.getLogs(page, limit);
  }
}
