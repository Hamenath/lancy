import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService, CreateProjectDto } from './projects.service';

@ApiTags('projects')
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project proposal' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  async findAll(@Query('category') category?: string) {
    return this.projectsService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }
}
