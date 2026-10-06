/**
 * Deal Signals — Structured indicators of acquisition potential.
 * Each signal is a boolean flag with a label.
 */

import type { ILead } from '../models/Lead';
import type { IICP } from '../models/ICP';

export interface DealSignal {
  key: string;
  label: string;
  met: boolean;
  detail: string;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function detectSignals(lead: ILead, icp: IICP): DealSignal[] {
  const signals: DealSignal[] = [];

  // Revenue in target range
  const revenueInRange =
    lead.revenue !== null &&
    lead.revenue >= icp.minRevenue &&
    lead.revenue <= icp.maxRevenue;
  signals.push({
    key: 'revenue_fit',
    label: 'Revenue in Target Range',
    met: revenueInRange,
    detail: revenueInRange
      ? `${formatCurrency(lead.revenue!)} is within ${formatCurrency(icp.minRevenue)}–${formatCurrency(icp.maxRevenue)}`
      : lead.revenue !== null
        ? `${formatCurrency(lead.revenue)} is outside target range`
        : 'Revenue data not available',
  });

  // Industry match
  const industryMatch =
    lead.industry &&
    icp.industries.some(
      (i) => i.toLowerCase() === lead.industry.toLowerCase()
    );
  signals.push({
    key: 'industry_match',
    label: 'Industry Match',
    met: !!industryMatch,
    detail: industryMatch
      ? `${lead.industry} matches ICP criteria`
      : `${lead.industry} not in target industries`,
  });

  // Employee count fit
  const empInRange =
    lead.employees !== null &&
    lead.employees >= icp.minEmployees &&
    lead.employees <= icp.maxEmployees;
  signals.push({
    key: 'employee_fit',
    label: 'Strong Employee Count',
    met: empInRange,
    detail: empInRange
      ? `${lead.employees} employees within ${icp.minEmployees}–${icp.maxEmployees} range`
      : lead.employees !== null
        ? `${lead.employees} employees outside target range`
        : 'Employee data not available',
  });

  // Growth signal
  const hasGrowth =
    (lead.revenueGrowthPercent !== null && lead.revenueGrowthPercent > 10) ||
    (lead.employeeGrowthPercent !== null && lead.employeeGrowthPercent > 10);
  const growthParts: string[] = [];
  if (lead.revenueGrowthPercent !== null)
    growthParts.push(`${lead.revenueGrowthPercent}% revenue growth`);
  if (lead.employeeGrowthPercent !== null)
    growthParts.push(`${lead.employeeGrowthPercent}% employee growth`);
  signals.push({
    key: 'growth_signal',
    label: 'Growth Signal',
    met: hasGrowth,
    detail: hasGrowth
      ? growthParts.join(', ')
      : growthParts.length > 0
        ? `Modest growth: ${growthParts.join(', ')}`
        : 'Growth data not available',
  });

  // Decision maker found
  const hasDecisionMaker =
    lead.contact &&
    lead.contact.name !== '' &&
    lead.contact.title !== '' &&
    lead.contact.email !== '';
  signals.push({
    key: 'decision_maker',
    label: 'Decision Maker Found',
    met: !!hasDecisionMaker,
    detail: hasDecisionMaker
      ? `${lead.contact.name} (${lead.contact.title})`
      : 'Contact information incomplete',
  });

  // High data completeness
  const completeness = lead.signals?.dataCompleteness ?? 0;
  signals.push({
    key: 'data_completeness',
    label: 'High Data Completeness',
    met: completeness >= 0.8,
    detail: `${Math.round(completeness * 100)}% of key fields populated`,
  });

  // Potential acquisition fit (composite)
  const acquisitionFit =
    revenueInRange && industryMatch && empInRange && hasDecisionMaker;
  signals.push({
    key: 'acquisition_fit',
    label: 'Potential Acquisition Fit',
    met: !!acquisitionFit,
    detail: acquisitionFit
      ? 'Meets core acquisition criteria (revenue, industry, size, contact)'
      : 'Does not meet all core acquisition criteria',
  });

  return signals;
}
