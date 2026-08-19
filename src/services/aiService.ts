import { apiFetch } from "./apiConfig";

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
  name: string;
  photo?: string;
  title: string;
  rating: number;
  hourlyRate: number;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
}

export interface ProjectRecommendationResult {
  projectId: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  clientName: string;
  matchScore: number;
  matchingSkills: string[];
  reason: string;
}

export const aiService = {
  async extractSkills(text: string): Promise<SkillExtractionResult | null> {
    return apiFetch<SkillExtractionResult>("/ai/extract-skills", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  async improveProject(title: string, description: string): Promise<ProjectImprovementResult | null> {
    return apiFetch<ProjectImprovementResult>("/ai/improve-project", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },

  async improveProfile(headline: string, bio: string, skills: string[]): Promise<ProfileImprovementResult | null> {
    return apiFetch<ProfileImprovementResult>("/ai/improve-profile", {
      method: "POST",
      body: JSON.stringify({ headline, bio, skills }),
    });
  },

  async improveProposal(projectId: string, coverLetter: string): Promise<ProposalImprovementResult | null> {
    return apiFetch<ProposalImprovementResult>("/ai/improve-proposal", {
      method: "POST",
      body: JSON.stringify({ projectId, coverLetter }),
    });
  },

  async matchFreelancers(projectId: string): Promise<CandidateMatchResult[]> {
    const res = await apiFetch<CandidateMatchResult[]>("/ai/match/freelancers", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    });
    return res || [];
  },

  async getRecommendedProjects(): Promise<ProjectRecommendationResult[]> {
    const res = await apiFetch<ProjectRecommendationResult[]>("/ai/recommendations/projects");
    return res || [];
  },

  async chatAssistant(prompt: string): Promise<{ response: string } | null> {
    return apiFetch<{ response: string }>("/ai/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  },
};
