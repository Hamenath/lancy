import { apiFetch } from "./apiConfig";
import type { Milestone } from "./contractService";

export interface CreateMilestoneDto {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
  order?: number;
}

export const milestoneService = {
  async createMilestone(contractId: string, dto: CreateMilestoneDto): Promise<Milestone | null> {
    return apiFetch<Milestone>(`/contracts/${contractId}/milestones`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async getMilestones(contractId: string): Promise<Milestone[]> {
    const res = await apiFetch<Milestone[]>(`/contracts/${contractId}/milestones`);
    return res || [];
  },

  async startMilestone(id: string): Promise<Milestone | null> {
    return apiFetch<Milestone>(`/milestones/${id}/start`, {
      method: "POST",
    });
  },

  async submitMilestone(id: string): Promise<Milestone | null> {
    return apiFetch<Milestone>(`/milestones/${id}/submit`, {
      method: "POST",
    });
  },

  async requestChanges(id: string, reason: string): Promise<Milestone | null> {
    return apiFetch<Milestone>(`/milestones/${id}/request-changes`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async approveMilestone(id: string): Promise<Milestone | null> {
    return apiFetch<Milestone>(`/milestones/${id}/approve`, {
      method: "POST",
    });
  },
};
