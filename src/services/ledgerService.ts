import { apiFetch } from "./apiConfig";

export interface UserFinancialSummary {
  userId: string;
  totalEarned: number;
  totalSpent: number;
  totalRefunded: number;
  currency: string;
  formattedTotalEarned: string;
  formattedTotalSpent: string;
  formattedTotalRefunded: string;
}

export const ledgerService = {
  async getMyFinancialSummary(): Promise<UserFinancialSummary | null> {
    return apiFetch<UserFinancialSummary>('/earnings/me');
  },
};
