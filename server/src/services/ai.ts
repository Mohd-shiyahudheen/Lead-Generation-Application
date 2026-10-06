/**
 * AI Explanation Service
 * Optional — generates natural-language recommendations.
 * ALWAYS falls back to deterministic template if AI is unavailable.
 */

import type { ILead } from '../models/Lead';
import type { IICP } from '../models/ICP';
import type { DealSignal } from './signals';

function priorityLabel(p: string): string {
  switch (p) {
    case 'A': return 'high-priority';
    case 'B': return 'good';
    case 'C': return 'moderate';
    default: return 'low-priority';
  }
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

/**
 * Deterministic fallback — always works, no external dependencies.
 */
export function generateDeterministicExplanation(
  lead: ILead,
  icp: IICP,
  signals: DealSignal[]
): string {
  const metSignals = signals.filter((s) => s.met);
  const label = priorityLabel(lead.priority);

  const company = lead.companyName || 'This company';
  let explanation = `${company} appears to be a ${label} acquisition candidate`;

  if (metSignals.length > 0) {
    const topReasons = metSignals
      .slice(0, 3)
      .map((s) => s.detail)
      .join('; ');
    explanation += ` because ${topReasons}.`;
  } else {
    explanation += `, though limited data matches the current ICP criteria.`;
  }

  // Add action recommendation
  if (lead.priority === 'A') {
    explanation += ` Recommended action: Prioritize outreach — ${lead.contact?.name ? `contact ${lead.contact.name}` : 'identify a decision maker'} for an initial conversation.`;
  } else if (lead.priority === 'B') {
    explanation += ` Recommended action: Add to shortlist for further research and validation.`;
  } else if (lead.priority === 'C') {
    explanation += ` Recommended action: Review when higher-priority leads have been addressed. Consider enriching data to improve assessment.`;
  } else {
    explanation += ` Recommended action: Deprioritize unless new data changes the profile.`;
  }

  return explanation;
}

/**
 * Attempt AI explanation. Falls back to deterministic on any failure.
 */
export async function generateExplanation(
  lead: ILead,
  icp: IICP,
  signals: DealSignal[]
): Promise<{ explanation: string; source: 'ai' | 'deterministic' }> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;

  // No AI configured — use deterministic
  if (!apiKey || !apiUrl) {
    return {
      explanation: generateDeterministicExplanation(lead, icp, signals),
      source: 'deterministic',
    };
  }

  try {
    const prompt = buildPrompt(lead, icp, signals);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a concise business analyst. Generate a 2-3 sentence assessment of a company as an acquisition target. Be specific and actionable.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`AI API returned ${response.status}`);

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const aiExplanation = data.choices?.[0]?.message?.content;

    if (!aiExplanation) throw new Error('No AI response content');

    return { explanation: aiExplanation.trim(), source: 'ai' };
  } catch (error) {
    // AI failed — use deterministic fallback (never break the product)
    console.warn('AI explanation failed, using deterministic fallback:', error);
    return {
      explanation: generateDeterministicExplanation(lead, icp, signals),
      source: 'deterministic',
    };
  }
}

function buildPrompt(lead: ILead, icp: IICP, signals: DealSignal[]): string {
  const metSignals = signals.filter((s) => s.met).map((s) => s.label);
  const missedSignals = signals.filter((s) => !s.met).map((s) => s.label);

  return `Assess this company as an acquisition target:

Company: ${lead.companyName}
Industry: ${lead.industry}
Revenue: ${lead.revenue ? formatCurrency(lead.revenue) : 'Unknown'}
Employees: ${lead.employees ?? 'Unknown'}
Score: ${lead.score}/100 (Priority: ${lead.priority})
Contact: ${lead.contact?.name || 'Unknown'} — ${lead.contact?.title || 'Unknown'}

ICP Target: ${icp.industries.join(', ')} | Revenue: ${formatCurrency(icp.minRevenue)}–${formatCurrency(icp.maxRevenue)} | Employees: ${icp.minEmployees}–${icp.maxEmployees}

Positive signals: ${metSignals.join(', ') || 'None'}
Missing signals: ${missedSignals.join(', ') || 'None'}

Provide a concise 2-3 sentence assessment and recommended action.`;
}
