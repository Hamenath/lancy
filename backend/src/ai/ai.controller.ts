import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('ai')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-skills')
  @ApiOperation({ summary: 'Extract skills from profile bio or project description' })
  async extractSkills(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body('text') text: string,
  ) {
    return this.aiService.extractSkills(user ? user.id : null, text || '');
  }

  @Post('improve-project')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI project description & deliverables assistant' })
  async improveProject(
    @CurrentUser() user: AuthenticatedUser,
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    return this.aiService.improveProject(user.id, title || '', description || '');
  }

  @Post('improve-profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI profile optimization suggestions' })
  async improveProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body('headline') headline: string,
    @Body('bio') bio: string,
    @Body('skills') skills: string[],
  ) {
    return this.aiService.improveProfile(user.id, headline || '', bio || '', skills || []);
  }

  @Post('improve-proposal')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI proposal drafting assistant (Grounded in verified profile history)' })
  async improveProposal(
    @CurrentUser() user: AuthenticatedUser,
    @Body('projectId') projectId: string,
    @Body('coverLetter') coverLetter: string,
  ) {
    return this.aiService.improveProposal(user.id, projectId, coverLetter || '');
  }

  @Post('match/freelancers')
  @ApiOperation({ summary: 'Hybrid semantic matching of candidate freelancers for a project' })
  async matchFreelancers(@Body('projectId') projectId: string) {
    return this.aiService.matchFreelancersForProject(projectId);
  }

  @Get('recommendations/projects')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recommend matching projects for authenticated freelancer' })
  async recommendProjects(@CurrentUser() user: AuthenticatedUser) {
    return this.aiService.recommendProjectsForFreelancer(user.id);
  }

  @Post('assistant/chat')
  @ApiOperation({ summary: 'Conversational marketplace AI assistant' })
  async chat(
    @CurrentUser() user: AuthenticatedUser | null,
    @Body('prompt') prompt: string,
  ) {
    return this.aiService.chatAssistant(user ? user.id : null, prompt || '');
  }
}
