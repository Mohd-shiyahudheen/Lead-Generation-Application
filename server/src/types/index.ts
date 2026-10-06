// Shared TypeScript interfaces for SaaSquatch Signal

export interface LeadContact {
  name: string;
  title: string;
  email: string;
  linkedin?: string;
}

export interface LeadSignals {
  revenueFit: number;       // 0–1
  industryFit: number;      // 0–1
  employeeFit: number;      // 0–1
  growthSignal: number;     // 0–1
  dataCompleteness: number; // 0–1
}

export interface LeadDocument {
  _id?: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  revenue: number | null;
  employees: number | null;
  foundedYear: number | null;
  description: string;
  revenueGrowthPercent: number | null;
  employeeGrowthPercent: number | null;
  contact: LeadContact;
  signals: LeadSignals;
  score: number;
  priority: 'A' | 'B' | 'C' | 'D';
  scoreReasons: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICPDocument {
  _id?: string;
  name: string;
  industries: string[];
  minRevenue: number;
  maxRevenue: number;
  minEmployees: number;
  maxEmployees: number;
  locations: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardMetrics {
  total: number;
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
  avgScore: number;
  topLeads: LeadDocument[];
  activeICP: ICPDocument | null;
}

export interface LeadQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  industry?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export const SCORE_WEIGHTS = {
  revenueFit: 0.25,
  industryFit: 0.20,
  employeeFit: 0.20,
  growthSignal: 0.20,
  dataCompleteness: 0.15,
} as const;

export const PRIORITY_THRESHOLDS = {
  A: 90,
  B: 75,
  C: 60,
} as const;
