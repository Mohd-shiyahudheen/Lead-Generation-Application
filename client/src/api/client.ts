import {
  DashboardMetrics,
  PaginatedLeads,
  LeadQueryParams,
  Lead,
  ICP,
  DealSignal,
} from '../types';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchLeads(params: LeadQueryParams = {}): Promise<PaginatedLeads> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.search) query.set('search', params.search);
  if (params.priority) query.set('priority', params.priority);
  if (params.industry) query.set('industry', params.industry);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const res = await fetch(`${API_BASE}/leads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadById(
  id: string
): Promise<{ lead: Lead; dealSignals: DealSignal[] }> {
  const res = await fetch(`${API_BASE}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead details');
  return res.json();
}

export async function fetchActiveICP(): Promise<{ icp: ICP }> {
  const res = await fetch(`${API_BASE}/icp`);
  if (!res.ok) throw new Error('Failed to fetch active ICP');
  return res.json();
}

export async function saveICP(
  data: Partial<ICP>
): Promise<{ icp: ICP; scoredCount: number; message: string }> {
  const res = await fetch(`${API_BASE}/icp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to save ICP');
  }
  return res.json();
}

export async function analyzeLeads(): Promise<{ scored: number; message: string }> {
  const res = await fetch(`${API_BASE}/leads/analyze`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to analyze leads');
  return res.json();
}

export async function resetDemoDataset(): Promise<{ count: number; message: string }> {
  const res = await fetch(`${API_BASE}/leads/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset dataset');
  return res.json();
}

export async function explainLead(
  id: string
): Promise<{ explanation: string; source: 'ai' | 'deterministic'; dealSignals: DealSignal[] }> {
  const res = await fetch(`${API_BASE}/leads/${id}/explain`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate lead explanation');
  return res.json();
}
