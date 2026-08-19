import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FreelancersService } from './freelancers.service';

@ApiTags('freelancers')
@Controller('api/v1/freelancers')
export class FreelancersController {
  constructor(private readonly freelancersService: FreelancersService) {}

  @Get()
  @ApiOperation({ summary: 'List all freelancers with optional search & filtering' })
  async findAll(@Query('search') search?: string, @Query('skill') skill?: string) {
    return this.freelancersService.findAll(search, skill);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get freelancer profile by ID' })
  async findOne(@Param('id') id: string) {
    return this.freelancersService.findOne(id);
  }
}
