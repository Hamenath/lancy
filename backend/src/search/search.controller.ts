import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('freelancers')
  @ApiOperation({ summary: 'Paginated freelancer discovery & structured filtering' })
  async searchFreelancers(
    @Query('q') q?: string,
    @Query('skills') skills?: string,
    @Query('location') location?: string,
    @Query('minRate') minRate?: number,
    @Query('maxRate') maxRate?: number,
    @Query('minRating') minRating?: number,
    @Query('availability') availability?: string,
    @Query('experience') experience?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
  ) {
    return this.searchService.searchFreelancers({
      q,
      skills: skills ? skills.split(',') : undefined,
      location,
      minRate,
      maxRate,
      minRating,
      availability,
      experience,
      page,
      limit,
      sort,
    });
  }

  @Get('projects')
  @ApiOperation({ summary: 'Paginated project discovery & budget filtering' })
  async searchProjects(
    @Query('q') q?: string,
    @Query('skills') skills?: string,
    @Query('minBudget') minBudget?: number,
    @Query('maxBudget') maxBudget?: number,
    @Query('projectType') projectType?: string,
    @Query('experience') experience?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
  ) {
    return this.searchService.searchProjects({
      q,
      skills: skills ? skills.split(',') : undefined,
      minBudget,
      maxBudget,
      projectType,
      experience,
      page,
      limit,
      sort,
    });
  }

  @Get('skills/popular')
  @ApiOperation({ summary: 'Get popular marketplace skills based on real DB listings' })
  async getPopularSkills() {
    return this.searchService.getPopularSkills();
  }

  @Get('projects/featured')
  @ApiOperation({ summary: 'Get active featured marketplace projects' })
  async getFeaturedProjects() {
    return this.searchService.getFeaturedProjects();
  }
}
