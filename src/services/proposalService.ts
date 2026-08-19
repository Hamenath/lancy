import { apiFetch } from "./apiConfig";
import type { Project } from "../types";

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  bidAmount: number;
  proposedBudget?: number;
  estimatedDays: number;
  coverLetter: string;
  status: string; // PENDING | SHORTLISTED | ACCEPTED | REJECTED | WITHDRAWN
  createdAt: string;
  updatedAt?: string;
  project?: Project;
  freelancer?: {
    id: string;
    name: string;
    photo?: string;
  };
}

export interface CreateProposalDto {
  bidAmount: number;
  proposedBudget?: number;
  estimatedDays?: number;
  coverLetter: string;
}

export const proposalService = {
  async submitProposal(projectId: string, dto: CreateProposalDto): Promise<Proposal | null> {
    return apiFetch<Proposal>(`/projects/${projectId}/proposals`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async getProjectProposals(projectId: string): Promise<Proposal[]> {
    const res = await apiFetch<Proposal[]>(`/projects/${projectId}/proposals`);
    return res || [];
  },

  async getMyProposals(): Promise<Proposal[]> {
    const res = await apiFetch<Proposal[]>(`/proposals/me`);
    return res || [];
  },

  async shortlistProposal(proposalId: string): Promise<Proposal | null> {
    return apiFetch<Proposal>(`/proposals/${proposalId}/shortlist`, {
      method: "POST",
    });
  },

  async rejectProposal(proposalId: string): Promise<Proposal | null> {
    return apiFetch<Proposal>(`/proposals/${proposalId}/reject`, {
      method: "POST",
    });
  },

  async acceptProposal(proposalId: string): Promise<Proposal | null> {
    return apiFetch<Proposal>(`/proposals/${proposalId}/accept`, {
      method: "POST",
    });
  },

  async withdrawProposal(proposalId: string): Promise<Proposal | null> {
    return apiFetch<Proposal>(`/proposals/${proposalId}/withdraw`, {
      method: "POST",
    });
  },
};
