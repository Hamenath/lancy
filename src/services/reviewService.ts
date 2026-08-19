import { apiFetch } from "./apiConfig";

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  communicationRating: number;
  qualityRating: number;
  professionalismRating: number;
  comment: string;
  status: string;
  verified: boolean;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    photo?: string;
  };
  reviewee?: {
    id: string;
    name: string;
    photo?: string;
  };
  contract?: {
    id: string;
    title: string;
  };
}

export interface UserReputationSummary {
  userId: string;
  averageRating: number;
  formattedAverageRating: string;
  totalReviews: number;
  completedContractsCount: number;
  categoryAverages: {
    communication: number;
    quality: number;
    professionalism: number;
  };
  distribution: Record<number, number>;
}

export interface CreateReviewDto {
  rating: number;
  communicationRating?: number;
  qualityRating?: number;
  professionalismRating?: number;
  comment: string;
}

export const reviewService = {
  async createContractReview(contractId: string, dto: CreateReviewDto): Promise<Review | null> {
    return apiFetch<Review>(`/contracts/${contractId}/reviews`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async getContractReviews(contractId: string): Promise<Review[]> {
    const res = await apiFetch<Review[]>(`/contracts/${contractId}/reviews`);
    return res || [];
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    const res = await apiFetch<Review[]>(`/users/${userId}/reviews`);
    return res || [];
  },

  async getUserReputation(userId: string): Promise<UserReputationSummary | null> {
    return apiFetch<UserReputationSummary>(`/users/${userId}/reputation`);
  },

  async updateReview(reviewId: string, dto: Partial<CreateReviewDto>): Promise<Review | null> {
    return apiFetch<Review>(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  async reportReview(reviewId: string, reason: string, description?: string): Promise<any> {
    return apiFetch(`/reviews/${reviewId}/report`, {
      method: "POST",
      body: JSON.stringify({ reason, description }),
    });
  },
};
