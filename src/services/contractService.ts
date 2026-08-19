import { apiFetch } from "./apiConfig";
import type { Project } from "../types";

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
  order: number;
  status: string; // PENDING | IN_PROGRESS | SUBMITTED | CHANGES_REQUESTED | APPROVED | CANCELLED
  submittedAt?: string;
  approvedAt?: string;
  changeReason?: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  agreedAmount: number;
  currency: string;
  startDate: string;
  expectedEndDate?: string;
  status: string; // DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
  createdAt: string;
  project?: Project;
  client?: {
    id: string;
    name: string;
    photo?: string;
  };
  freelancer?: {
    id: string;
    name: string;
    photo?: string;
  };
  milestones?: Milestone[];
}

export const contractService = {
  async getMyContracts(): Promise<Contract[]> {
    const res = await apiFetch<Contract[]>('/contracts/me');
    return res || [];
  },

  async getContractById(id: string): Promise<Contract | null> {
    return apiFetch<Contract>(`/contracts/${id}`);
  },
};
