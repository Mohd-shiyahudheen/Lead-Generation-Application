/**
 * SaaSquatch Signal — Scoring Engine
 *
 * Deterministic, explainable, testable lead scoring.
 * Scores leads 0–100 based on fit against an ICP (Ideal Customer Profile).
 *
 * Factor weights:
 *   Revenue Fit       25%
 *   Industry Fit      20%
 *   Employee Fit      20%
 *   Growth Signal     20%
 *   Data Completeness 15%
 */

import { SCORE_WEIGHTS, PRIORITY_THRESHOLDS } from '../types';

export interface ScoringInput {
  revenue: number | null;
  employees: number | null;
  industry: string;
  foundedYear: number | null;
  revenueGrowthPercent: number | null;
  employeeGrowthPercent: number | null;
  companyName: string;
  website: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  contactLinkedin?: string;
}

export interface ICPCriteria {
  industries: string[];
  minRevenue: number;
  maxRevenue: number;
  minEmployees: number;
  maxEmployees: number;
  locations: string[];
}

export interface ScoreFactors {
  revenueFit: number;
  industryFit: number;
  employeeFit: number;
  growthSignal: number;
  dataCompleteness: number;
}

export interface ScoringResult {
  score: number;
  priority: 'A' | 'B' | 'C' | 'D';
  factors: ScoreFactors;
  reasons: string[];
}

// ── Factor Calculations ──────────────────────────────────────────

/**
 * Revenue Fit (0–1): How well the company's revenue matches the ICP range.
 * - 1.0 if within range
 * - Linear decay as distance from range increases (halves at 2× distance)
 * - 0.3 if revenue data missing
 */
export function calculateRevenueFit(
  revenue: number | null,
  minRevenue: number,
  maxRevenue: number
): number {
  if (revenue === null || revenue === undefined) return 0.3;
  if (revenue >= minRevenue && revenue <= maxRevenue) return 1.0;

  const rangeSize = maxRevenue - minRevenue;
  const buffer = rangeSize * 0.5; // 50% of range as buffer

  if (revenue < minRevenue) {
    const distance = minRevenue - revenue;
    return Math.max(0, 1 - distance / (buffer || 1));
  }

  // revenue > maxRevenue
  const distance = revenue - maxRevenue;
  return Math.max(0, 1 - distance / (buffer || 1));
}

/**
 * Industry Fit (0–1): How well the company's industry matches ICP criteria.
 * - 1.0 for exact match
 * - 0.5 for partial/related match (substring)
 * - 0.0 for no match
 */
export function calculateIndustryFit(
  industry: string,
  targetIndustries: string[]
): number {
  if (!industry || targetIndustries.length === 0) return 0.0;

  const normalizedIndustry = industry.toLowerCase().trim();

  // Exact match
  for (const target of targetIndustries) {
    if (normalizedIndustry === target.toLowerCase().trim()) return 1.0;
  }

  // Partial match (substring or token overlap)
  for (const target of targetIndustries) {
    const normalizedTarget = target.toLowerCase().trim();
    if (
      normalizedIndustry.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedIndustry)
    ) {
      return 0.5;
    }
  }

  // Keyword token match (e.g. "Cloud Solutions" and "Cloud Infrastructure")
  const industryTokens = normalizedIndustry.split(/[\s/,-]+/).filter((t) => t.length > 2);
  for (const target of targetIndustries) {
    const targetTokens = target.toLowerCase().trim().split(/[\s/,-]+/).filter((t) => t.length > 2);
    const hasCommonToken = industryTokens.some((t) => targetTokens.includes(t));
    if (hasCommonToken) {
      return 0.5;
    }
  }

  return 0.0;
}

/**
 * Employee Fit (0–1): How well employee count matches ICP range.
 * - Same logic as revenue fit
 * - 0.3 if data missing
 */
export function calculateEmployeeFit(
  employees: number | null,
  minEmployees: number,
  maxEmployees: number
): number {
  if (employees === null || employees === undefined) return 0.3;
  if (employees >= minEmployees && employees <= maxEmployees) return 1.0;

  const rangeSize = maxEmployees - minEmployees;
  const buffer = rangeSize * 0.5;

  if (employees < minEmployees) {
    const distance = minEmployees - employees;
    return Math.max(0, 1 - distance / (buffer || 1));
  }

  const distance = employees - maxEmployees;
  return Math.max(0, 1 - distance / (buffer || 1));
}

/**
 * Growth Signal (0–1): Composite growth indicator.
 * Uses explicit growth data (revenueGrowthPercent, employeeGrowthPercent).
 * Falls back to heuristic based on company age + size if growth data unavailable.
 */
export function calculateGrowthSignal(
  revenueGrowthPercent: number | null,
  employeeGrowthPercent: number | null,
  foundedYear: number | null,
  revenue: number | null,
  employees: number | null
): number {
  let hasExplicitData = false;
  let growthScore = 0;
  let factors = 0;

  // Revenue growth (capped at 100% for normalization)
  if (revenueGrowthPercent !== null && revenueGrowthPercent !== undefined) {
    hasExplicitData = true;
    const normalizedRevGrowth = Math.min(Math.max(revenueGrowthPercent, -50), 100);
    // Map -50..100 → 0..1
    growthScore += (normalizedRevGrowth + 50) / 150;
    factors++;
  }

  // Employee growth (capped similarly)
  if (employeeGrowthPercent !== null && employeeGrowthPercent !== undefined) {
    hasExplicitData = true;
    const normalizedEmpGrowth = Math.min(Math.max(employeeGrowthPercent, -50), 100);
    growthScore += (normalizedEmpGrowth + 50) / 150;
    factors++;
  }

  if (hasExplicitData && factors > 0) {
    return Math.min(1, growthScore / factors);
  }

  // Fallback heuristic: younger companies with decent metrics suggest growth
  if (foundedYear !== null) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - foundedYear;

    if (age <= 0) return 0.5;
    if (age <= 3) return 0.8; // Very young → assumed growing
    if (age <= 7) return 0.6; // Established but still growing
    if (age <= 15) return 0.4; // Mature
    return 0.3; // Very established
  }

  return 0.3; // No data at all
}

/**
 * Data Completeness (0–1): What fraction of important fields are populated.
 */
export function calculateDataCompleteness(lead: ScoringInput): number {
  const fields = [
    { value: lead.companyName, weight: 1 },
    { value: lead.website, weight: 1 },
    { value: lead.industry, weight: 1 },
    { value: lead.location, weight: 1 },
    { value: lead.revenue, weight: 1.5 },
    { value: lead.employees, weight: 1 },
    { value: lead.foundedYear, weight: 0.5 },
    { value: lead.contactName, weight: 1 },
    { value: lead.contactEmail, weight: 1.5 },
    { value: lead.contactTitle, weight: 0.5 },
  ];

  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = fields.reduce((sum, f) => {
    const isPresent =
      f.value !== null &&
      f.value !== undefined &&
      f.value !== '' &&
      f.value !== 0;
    return sum + (isPresent ? f.weight : 0);
  }, 0);

  return completedWeight / totalWeight;
}

// ── Score Computation ────────────────────────────────────────────

export function computeScore(factors: ScoreFactors): number {
  const raw =
    factors.revenueFit * SCORE_WEIGHTS.revenueFit +
    factors.industryFit * SCORE_WEIGHTS.industryFit +
    factors.employeeFit * SCORE_WEIGHTS.employeeFit +
    factors.growthSignal * SCORE_WEIGHTS.growthSignal +
    factors.dataCompleteness * SCORE_WEIGHTS.dataCompleteness;

  return Math.round(raw * 100);
}

export function classifyPriority(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= PRIORITY_THRESHOLDS.A) return 'A';
  if (score >= PRIORITY_THRESHOLDS.B) return 'B';
  if (score >= PRIORITY_THRESHOLDS.C) return 'C';
  return 'D';
}

// ── Reason Generation ────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function generateScoreReasons(
  factors: ScoreFactors,
  lead: ScoringInput,
  icp: ICPCriteria
): string[] {
  const reasons: string[] = [];
  const maxPoints = (weight: number) => Math.round(weight * 100);
  const earnedPoints = (factor: number, weight: number) =>
    Math.round(factor * weight * 100);

  // Revenue
  if (lead.revenue !== null) {
    const earned = earnedPoints(factors.revenueFit, SCORE_WEIGHTS.revenueFit);
    const max = maxPoints(SCORE_WEIGHTS.revenueFit);
    if (factors.revenueFit >= 0.9) {
      reasons.push(
        `Revenue (${formatCurrency(lead.revenue)}) is within target range (${formatCurrency(icp.minRevenue)}–${formatCurrency(icp.maxRevenue)}) → +${earned}/${max}`
      );
    } else if (factors.revenueFit >= 0.5) {
      reasons.push(
        `Revenue (${formatCurrency(lead.revenue)}) is close to target range (${formatCurrency(icp.minRevenue)}–${formatCurrency(icp.maxRevenue)}) → +${earned}/${max}`
      );
    } else {
      reasons.push(
        `Revenue (${formatCurrency(lead.revenue)}) is outside target range (${formatCurrency(icp.minRevenue)}–${formatCurrency(icp.maxRevenue)}) → +${earned}/${max}`
      );
    }
  } else {
    reasons.push(
      `Revenue data unavailable → +${earnedPoints(factors.revenueFit, SCORE_WEIGHTS.revenueFit)}/${maxPoints(SCORE_WEIGHTS.revenueFit)}`
    );
  }

  // Industry
  {
    const earned = earnedPoints(factors.industryFit, SCORE_WEIGHTS.industryFit);
    const max = maxPoints(SCORE_WEIGHTS.industryFit);
    if (factors.industryFit >= 1.0) {
      reasons.push(`Industry (${lead.industry}) matches ICP criteria → +${earned}/${max}`);
    } else if (factors.industryFit >= 0.5) {
      reasons.push(
        `Industry (${lead.industry}) partially matches ICP criteria → +${earned}/${max}`
      );
    } else {
      reasons.push(
        `Industry (${lead.industry}) does not match ICP criteria → +${earned}/${max}`
      );
    }
  }

  // Employees
  if (lead.employees !== null) {
    const earned = earnedPoints(factors.employeeFit, SCORE_WEIGHTS.employeeFit);
    const max = maxPoints(SCORE_WEIGHTS.employeeFit);
    if (factors.employeeFit >= 0.9) {
      reasons.push(
        `Employee count (${lead.employees}) is within target range (${icp.minEmployees}–${icp.maxEmployees}) → +${earned}/${max}`
      );
    } else if (factors.employeeFit >= 0.5) {
      reasons.push(
        `Employee count (${lead.employees}) is near target range (${icp.minEmployees}–${icp.maxEmployees}) → +${earned}/${max}`
      );
    } else {
      reasons.push(
        `Employee count (${lead.employees}) is outside target range (${icp.minEmployees}–${icp.maxEmployees}) → +${earned}/${max}`
      );
    }
  } else {
    reasons.push(
      `Employee data unavailable → +${earnedPoints(factors.employeeFit, SCORE_WEIGHTS.employeeFit)}/${maxPoints(SCORE_WEIGHTS.employeeFit)}`
    );
  }

  // Growth
  {
    const earned = earnedPoints(factors.growthSignal, SCORE_WEIGHTS.growthSignal);
    const max = maxPoints(SCORE_WEIGHTS.growthSignal);
    const parts: string[] = [];
    if (lead.revenueGrowthPercent !== null) parts.push(`${lead.revenueGrowthPercent}% revenue growth`);
    if (lead.employeeGrowthPercent !== null) parts.push(`${lead.employeeGrowthPercent}% employee growth`);
    if (lead.foundedYear !== null) parts.push(`founded ${lead.foundedYear}`);

    if (factors.growthSignal >= 0.7) {
      reasons.push(
        `Strong growth signals${parts.length > 0 ? ` (${parts.join(', ')})` : ''} → +${earned}/${max}`
      );
    } else if (factors.growthSignal >= 0.4) {
      reasons.push(
        `Moderate growth signals${parts.length > 0 ? ` (${parts.join(', ')})` : ''} → +${earned}/${max}`
      );
    } else {
      reasons.push(
        `Limited growth signals${parts.length > 0 ? ` (${parts.join(', ')})` : ''} → +${earned}/${max}`
      );
    }
  }

  // Data Completeness
  {
    const earned = earnedPoints(factors.dataCompleteness, SCORE_WEIGHTS.dataCompleteness);
    const max = maxPoints(SCORE_WEIGHTS.dataCompleteness);
    const pct = Math.round(factors.dataCompleteness * 100);
    if (factors.dataCompleteness >= 0.8) {
      reasons.push(`High data completeness (${pct}%) → +${earned}/${max}`);
    } else if (factors.dataCompleteness >= 0.5) {
      reasons.push(`Moderate data completeness (${pct}%) → +${earned}/${max}`);
    } else {
      reasons.push(`Low data completeness (${pct}%) → +${earned}/${max}`);
    }
  }

  return reasons;
}

// ── Main Scoring Function ────────────────────────────────────────

export function scoreLead(lead: ScoringInput, icp: ICPCriteria): ScoringResult {
  const factors: ScoreFactors = {
    revenueFit: calculateRevenueFit(lead.revenue, icp.minRevenue, icp.maxRevenue),
    industryFit: calculateIndustryFit(lead.industry, icp.industries),
    employeeFit: calculateEmployeeFit(lead.employees, icp.minEmployees, icp.maxEmployees),
    growthSignal: calculateGrowthSignal(
      lead.revenueGrowthPercent,
      lead.employeeGrowthPercent,
      lead.foundedYear,
      lead.revenue,
      lead.employees
    ),
    dataCompleteness: calculateDataCompleteness(lead),
  };

  const score = computeScore(factors);
  const priority = classifyPriority(score);
  const reasons = generateScoreReasons(factors, lead, icp);

  return { score, priority, factors, reasons };
}
