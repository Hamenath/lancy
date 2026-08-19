export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  bio?: string;
  specialty?: string;
  skills?: string[];
  rate?: number;
  location?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Freelancer {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  skills: string[];
  rate: number;
  location: string;
  rating: number;
  reviewsCount: number;
  isVerified?: boolean;
  portfolioUrl?: string;
  portfolioTitle?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  freelancerId?: string;
  designerId?: string;
  clientId?: string;
  budget?: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  freelancerId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}
