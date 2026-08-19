import { apiFetch } from "./apiConfig";
import type { Freelancer } from "../types";
import type { Project } from "./projectService";

export interface SearchPaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FreelancerFilterParams {
  q?: string;
  skills?: string[];
  location?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  availability?: string;
  experience?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ProjectFilterParams {
  q?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  projectType?: string;
  experience?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const searchService = {
  async searchFreelancers(params: FreelancerFilterParams): Promise<SearchPaginatedResult<Freelancer>> {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.skills && params.skills.length > 0) query.append("skills", params.skills.join(","));
    if (params.location) query.append("location", params.location);
    if (params.minRate !== undefined) query.append("minRate", params.minRate.toString());
    if (params.maxRate !== undefined) query.append("maxRate", params.maxRate.toString());
    if (params.minRating !== undefined) query.append("minRating", params.minRating.toString());
    if (params.page !== undefined) query.append("page", params.page.toString());
    if (params.limit !== undefined) query.append("limit", params.limit.toString());
    if (params.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const endpoint = `/search/freelancers${queryString ? `?${queryString}` : ""}`;
    const res = await apiFetch<SearchPaginatedResult<Freelancer>>(endpoint);
    return res || { items: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
  },

  async searchProjects(params: ProjectFilterParams): Promise<SearchPaginatedResult<Project>> {
    const query = new URLSearchParams();
    if (params.q) query.append("q", params.q);
    if (params.skills && params.skills.length > 0) query.append("skills", params.skills.join(","));
    if (params.minBudget !== undefined) query.append("minBudget", params.minBudget.toString());
    if (params.maxBudget !== undefined) query.append("maxBudget", params.maxBudget.toString());
    if (params.projectType) query.append("projectType", params.projectType);
    if (params.page !== undefined) query.append("page", params.page.toString());
    if (params.limit !== undefined) query.append("limit", params.limit.toString());
    if (params.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const endpoint = `/search/projects${queryString ? `?${queryString}` : ""}`;
    const res = await apiFetch<SearchPaginatedResult<Project>>(endpoint);
    return res || { items: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
  },

  async getPopularSkills(): Promise<{ skill: string; count: number }[]> {
    const res = await apiFetch<{ skill: string; count: number }[]>("/search/skills/popular");
    return res || [];
  },

  async getFeaturedProjects(): Promise<Project[]> {
    const res = await apiFetch<Project[]>("/search/projects/featured");
    return res || [];
  },
};
