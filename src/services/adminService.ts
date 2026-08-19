import { apiFetch } from "./apiConfig";

export interface DashboardStats {
  totalUsers: number;
  activeFreelancers: number;
  activeClients: number;
  activeProjects: number;
  activeContracts: number;
  completedContracts: number;
  openReports: number;
  openDisputes: number;
  totalVolumeMinor: number;
  formattedTotalVolume: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  photo?: string;
  createdAt: string;
  profile?: {
    rating?: number;
    reviewsCount?: number;
  };
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    proposals: number;
    reports: number;
  };
}

export interface AdminDispute {
  id: string;
  contractId: string;
  reason: string;
  description: string;
  status: string;
  resolution?: string;
  createdAt: string;
  contract?: {
    id: string;
    title: string;
    agreedAmount: number;
  };
  openedBy?: {
    id: string;
    name: string;
    email: string;
  };
  resolvedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats | null> {
    return apiFetch<DashboardStats>("/admin/dashboard/stats");
  },

  async getUsers(page = 1, limit = 20, role?: string, status?: string, q?: string): Promise<{ items: AdminUser[]; pagination: any } | null> {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (role) query.append("role", role);
    if (status) query.append("status", status);
    if (q) query.append("q", q);
    return apiFetch<{ items: AdminUser[]; pagination: any }>(`/admin/users?${query.toString()}`);
  },

  async suspendUser(userId: string, reason: string): Promise<any> {
    return apiFetch(`/admin/users/${userId}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async restoreUser(userId: string): Promise<any> {
    return apiFetch(`/admin/users/${userId}/restore`, {
      method: "POST",
    });
  },

  async getProjects(page = 1, limit = 20, status?: string): Promise<{ items: AdminProject[]; pagination: any } | null> {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) query.append("status", status);
    return apiFetch<{ items: AdminProject[]; pagination: any }>(`/admin/projects?${query.toString()}`);
  },

  async moderateProject(projectId: string, status: string): Promise<any> {
    return apiFetch(`/admin/projects/${projectId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async getReports(): Promise<{ projectReports: any[]; reviewReports: any[] } | null> {
    return apiFetch("/admin/reports");
  },

  async getDisputes(status?: string): Promise<AdminDispute[]> {
    const endpoint = status ? `/admin/disputes?status=${encodeURIComponent(status)}` : "/admin/disputes";
    const res = await apiFetch<AdminDispute[]>(endpoint);
    return res || [];
  },

  async resolveDispute(disputeId: string, resolution: string, status = "RESOLVED"): Promise<any> {
    return apiFetch(`/admin/disputes/${disputeId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution, status }),
    });
  },

  async getAuditLogs(page = 1, limit = 20): Promise<{ items: AdminAuditLog[]; pagination: any } | null> {
    return apiFetch<{ items: AdminAuditLog[]; pagination: any }>(`/admin/audit-logs?page=${page}&limit=${limit}`);
  },
};
