export interface SkillExtractionResult {
  skills: { name: string; confidence: number }[];
  category?: string;
  experienceLevel?: string;
}

export interface ProjectImprovementResult {
  title: string;
  description: string;
  suggestedSkills: string[];
  suggestedDeliverables: string[];
}

export interface ProfileImprovementResult {
  headline: string;
  bio: string;
  suggestedSkills: string[];
  recommendations: string[];
}

export interface ProposalImprovementResult {
  suggestedDraft: string;
  keyHighlights: string[];
  suggestedQuestions: string[];
}

export interface CandidateMatchResult {
  freelancerId: string;
  matchScore: number; // 0.0 to 1.0
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
}

export interface AIProvider {
  name: string;
  extractSkills(text: string): Promise<SkillExtractionResult>;
  improveProject(title: string, description: string): Promise<ProjectImprovementResult>;
  improveProfile(headline: string, bio: string, skills: string[]): Promise<ProfileImprovementResult>;
  improveProposal(projectDescription: string, coverLetter: string, userBio?: string, userSkills?: string[]): Promise<ProposalImprovementResult>;
  chat(prompt: string, context?: string): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}
