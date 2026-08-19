import { apiFetch } from "./apiConfig";

export interface FreelancerAnalytics {
  userId: string;
  metrics: {
    profileViews: number;
    totalProposals: number;
    acceptedProposals: number;
    acceptanceRatePercentage: number;
    activeContracts: number;
    completedContracts: number;
    totalEarningsMinor: number;
    formattedTotalEarnings: string;
    rating: number;
    reviewsCount: number;
  };
  earningsTimeSeries: {
    month: string;
    amountMinor: number;
    formattedAmount: string;
  }[];
}

export interface ClientAnalytics {
  userId: string;
  metrics: {
    projectsPosted: number;
    activeProjects: number;
    totalProposalsReceived: number;
    activeContracts: number;
    completedContracts: number;
    projectFillRatePercentage: number;
    totalSpendingMinor: number;
    formattedTotalSpending: string;
  };
  spendingTimeSeries: {
    month: string;
    amountMinor: number;
    formattedAmount: string;
  }[];
}

export interface AdminAnalyticsOverview {
  metrics: {
    grossMarketplaceVolumeMinor: number;
    formattedGMV: string;
    platformRevenueMinor: number;
    formattedPlatformRevenue: string;
    totalUsers: number;
    totalProjects: number;
    totalContracts: number;
    contractCompletionRate: number;
    zeroResultSearchRatePercentage: number;
  };
  userGrowthTimeSeries: {
    month: string;
    count: number;
  }[];
}

export const analyticsService = {
  async trackEvent(eventType: string, entityType?: string, entityId?: string, metadata?: any): Promise<any> {
    return apiFetch("/analytics/events", {
      method: "POST",
      body: JSON.stringify({ eventType, entityType, entityId, metadata }),
    });
  },

  async getFreelancerAnalytics(): Promise<FreelancerAnalytics | null> {
    return apiFetch<FreelancerAnalytics>("/analytics/freelancer");
  },

  async getClientAnalytics(): Promise<ClientAnalytics | null> {
    return apiFetch<ClientAnalytics>("/analytics/client");
  },

  async getAdminAnalytics(): Promise<AdminAnalyticsOverview | null> {
    return apiFetch<AdminAnalyticsOverview>("/admin/analytics/overview");
  },

  async exportCsvReport(type: "revenue" | "users" | "projects"): Promise<string | null> {
    return apiFetch<string>(`/admin/analytics/export?type=${type}`);
  },
};
