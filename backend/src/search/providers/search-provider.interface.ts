export interface SearchFreelancersQuery {
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
  sort?: string; // relevance | rating | reviews | rate_asc | rate_desc | newest
}

export interface SearchProjectsQuery {
  q?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  projectType?: string;
  experience?: string;
  page?: number;
  limit?: number;
  sort?: string; // relevance | newest | budget_asc | budget_desc
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchProvider {
  searchFreelancers(query: SearchFreelancersQuery): Promise<PaginatedResult<any>>;
  searchProjects(query: SearchProjectsQuery): Promise<PaginatedResult<any>>;
}
