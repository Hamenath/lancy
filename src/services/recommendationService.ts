import { apiFetch } from "./apiConfig";

export interface ExplainableMatch {
  id: string;
  score: number;
  matchPercentage: number;
  explainabilityReason: string;
  signals: {
    skillOverlap: number;
    semanticScore: number;
    reputationScore: number;
    budgetCompatibility: number;
    freshnessScore: number;
    coldStartBoost: number;
  };
  item: any;
}

export interface RecommendationAnalytics {
  totalEvents: number;
  shownCount: number;
  clickedCount: number;
  dismissedCount: number;
  appliedCount: number;
  clickThroughRatePercentage: number;
  activeWeights: any;
}

export const recommendationService = {
  async getFreelancerRecommendations(projectId: string, limit = 5): Promise<ExplainableMatch[]> {
    const res = await apiFetch<ExplainableMatch[]>("/recommendations/freelancers", {
      method: "POST",
      body: JSON.stringify({ projectId, limit }),
    });
    return res || [];
  },

  async getProjectRecommendations(freelancerUserId: string, limit = 5): Promise<ExplainableMatch[]> {
    const res = await apiFetch<ExplainableMatch[]>("/recommendations/projects", {
      method: "POST",
      body: JSON.stringify({ freelancerUserId, limit }),
    });
    return res || [];
  },

  async recordFeedback(
    targetId: string, 
    recommendationType: "FREELANCER" | "PROJECT", 
    action: "SHOWN" | "CLICKED" | "DISMISSED" | "APPLIED" | "HIRED"
  ) {
    return apiFetch("/recommendations/feedback", {
      method: "POST",
      body: JSON.stringify({ targetId, recommendationType, action }),
    });
  },

  async getAnalytics(): Promise<RecommendationAnalytics | null> {
    return apiFetch<RecommendationAnalytics>("/admin/recommendations/analytics");
  },

  async updateWeights(weights: any) {
    return apiFetch("/admin/recommendations/weights", {
      method: "PATCH",
      body: JSON.stringify(weights),
    });
  },
};
