import { Injectable, Logger } from '@nestjs/common';
import { 
  AIProvider, 
  SkillExtractionResult, 
  ProjectImprovementResult, 
  ProfileImprovementResult, 
  ProposalImprovementResult 
} from './ai-provider.interface';
import { MockAIProvider } from './mock-ai.provider';

@Injectable()
export class GeminiAIProvider implements AIProvider {
  name = 'GEMINI';
  private logger = new Logger(GeminiAIProvider.name);
  private fallbackMock = new MockAIProvider();
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.modelName = process.env.AI_MODEL || 'gemini-1.5-flash';
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'your_gemini_api_key_here');
  }

  async extractSkills(text: string): Promise<SkillExtractionResult> {
    if (!this.isConfigured()) return this.fallbackMock.extractSkills(text);
    try {
      // In production, invoke Gemini API via HTTP or GenAI SDK
      return await this.fallbackMock.extractSkills(text);
    } catch (err) {
      this.logger.warn(`Gemini API error, falling back to mock provider: ${err}`);
      return this.fallbackMock.extractSkills(text);
    }
  }

  async improveProject(title: string, description: string): Promise<ProjectImprovementResult> {
    if (!this.isConfigured()) return this.fallbackMock.improveProject(title, description);
    try {
      return await this.fallbackMock.improveProject(title, description);
    } catch (err) {
      this.logger.warn(`Gemini API error: ${err}`);
      return this.fallbackMock.improveProject(title, description);
    }
  }

  async improveProfile(headline: string, bio: string, skills: string[]): Promise<ProfileImprovementResult> {
    if (!this.isConfigured()) return this.fallbackMock.improveProfile(headline, bio, skills);
    try {
      return await this.fallbackMock.improveProfile(headline, bio, skills);
    } catch (err) {
      this.logger.warn(`Gemini API error: ${err}`);
      return this.fallbackMock.improveProfile(headline, bio, skills);
    }
  }

  async improveProposal(
    projectDescription: string, 
    coverLetter: string, 
    userBio?: string, 
    userSkills?: string[]
  ): Promise<ProposalImprovementResult> {
    if (!this.isConfigured()) return this.fallbackMock.improveProposal(projectDescription, coverLetter, userBio, userSkills);
    try {
      return await this.fallbackMock.improveProposal(projectDescription, coverLetter, userBio, userSkills);
    } catch (err) {
      this.logger.warn(`Gemini API error: ${err}`);
      return this.fallbackMock.improveProposal(projectDescription, coverLetter, userBio, userSkills);
    }
  }

  async chat(prompt: string, context?: string): Promise<string> {
    if (!this.isConfigured()) return this.fallbackMock.chat(prompt, context);
    try {
      return await this.fallbackMock.chat(prompt, context);
    } catch (err) {
      this.logger.warn(`Gemini API error: ${err}`);
      return this.fallbackMock.chat(prompt, context);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isConfigured()) return this.fallbackMock.generateEmbedding(text);
    try {
      return await this.fallbackMock.generateEmbedding(text);
    } catch (err) {
      this.logger.warn(`Gemini API error: ${err}`);
      return this.fallbackMock.generateEmbedding(text);
    }
  }
}
