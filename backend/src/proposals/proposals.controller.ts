import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProposalsService, CreateProposalDto } from './proposals.service';

@ApiTags('proposals')
@Controller('api/v1/projects')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post(':id/proposals')
  @ApiOperation({ summary: 'Submit a proposal bid for a project' })
  async createProposal(
    @Param('id') projectId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalsService.createProposal(projectId, dto);
  }

  @Get(':id/proposals')
  @ApiOperation({ summary: 'Get all proposal bids for a project' })
  async getProposalsForProject(@Param('id') projectId: string) {
    return this.proposalsService.getProposalsForProject(projectId);
  }
}
