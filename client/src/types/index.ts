export interface LeadContact {
  name: string;
  title: string;
  email: string;
  linkedin?: string;
}

export interface LeadSignals {
  revenueFit: number;
  industryFit: number;
  employeeFit: number;
  growthSignal: number;
  dataCompleteness: number;
}

export interface Lead {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ICP {
  _id?: string;
  name: string;
  industries: string[];
  minRevenue: number;
  maxRevenue: number;
  minEmployees: number;
  maxEmployees: number;
  locations: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealSignal {
  key: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface DashboardMetrics {
  total: number;
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
  avgScore: number;
  topLeads: Lead[];
  activeICP: ICP | null;
  industryDistribution: Record<string, number>;
}

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
