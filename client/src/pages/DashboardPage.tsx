import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard } from '../api/client';
import { PriorityBadge } from '../components/PriorityBadge';
import { ScoreRing } from '../components/ScoreRing';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-900/50">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="font-semibold">Unable to load dashboard data</p>
      </div>
    );
  }

  const { total, aCount, bCount, cCount, dCount, avgScore, topLeads, activeICP } = data;

  const formatCurrency = (val?: number | null) => {
    if (!val) return '—';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Strategic Positioning Header */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaSquatch Signal Prioritization Layer</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              From thousands of companies to the companies worth pursuing first.
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Eliminate manual vetting. Every discovered lead is scored against your acquisition criteria
              with 100% transparent factor breakdowns, structured deal signals, and actionable intelligence.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate('/leads')}
              className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95"
            >
              <span>Explore Ranked Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL ANALYZED</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{total}</span>
            <span className="text-xs text-slate-400 ml-2">companies</span>
          </div>
          <p className="text-xs text-slate-400">Full discovery catalog</p>
        </div>

        {/* Tier A */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>TIER A • HIGH PRIORITY</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{aCount}</span>
            <span className="text-xs text-emerald-400 ml-2">
              ({total > 0 ? Math.round((aCount / total) * 100) : 0}% of pool)
            </span>
          </div>
          <p className="text-xs text-emerald-400">Immediate outreach candidates</p>
        </div>

        {/* Tier B */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between border-sky-500/20 bg-sky-950/10">
          <div className="flex items-center justify-between text-sky-400 text-xs font-semibold">
            <span>TIER B • GOOD CANDIDATES</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-sky-400 tracking-tight">{bCount}</span>
            <span className="text-xs text-sky-400 ml-2">
              ({total > 0 ? Math.round((bCount / total) * 100) : 0}%)
            </span>
          </div>
          <p className="text-xs text-sky-400">Solid candidates for shortlist</p>
        </div>

        {/* Avg Pipeline Quality */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>AVG FIT SCORE</span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{avgScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Tiers:</span>
            <span className="text-amber-400">{cCount} C</span>
            <span>•</span>
            <span className="text-slate-400">{dCount} D</span>
          </div>
        </div>
      </div>

      {/* Active ICP Summary & Target Profile */}
      {activeICP && (
        <div className="p-6 rounded-2xl glass-panel border-brand-500/20 bg-slate-900/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-300">
                Active ICP Profile: {activeICP.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
              <span className="text-slate-400 font-medium">Target Industries:</span>
              {activeICP.industries.map((ind) => (
                <span
                  key={ind}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700/60 font-medium"
                >
                  {ind}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>
                Revenue Range:{' '}
                <strong className="text-slate-200">
                  {formatCurrency(activeICP.minRevenue)} – {formatCurrency(activeICP.maxRevenue)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Employee Size:{' '}
                <strong className="text-slate-200">
                  {activeICP.minEmployees} – {activeICP.maxEmployees} team members
                </strong>
              </span>
              <span>•</span>
              <span>
                Locations:{' '}
                <strong className="text-slate-200">{activeICP.locations.join(', ')}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/icp')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" />
            <span>Customize ICP Criteria</span>
          </button>
        </div>
      )}

      {/* Top Prioritized Leads Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Highest-Ranked Acquisition Candidates</span>
            </h2>
            <p className="text-xs text-slate-400">
              Ranked dynamically by the deterministic multi-factor scoring engine
            </p>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            <span>View All {total} Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-5">Score & Tier</th>
                  <th className="py-3.5 px-5">Company</th>
                  <th className="py-3.5 px-5">Industry</th>
                  <th className="py-3.5 px-5">Annual Revenue</th>
                  <th className="py-3.5 px-5">Team Size</th>
                  <th className="py-3.5 px-5">Decision Maker</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {topLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="hover:bg-slate-850/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <ScoreRing score={lead.score} size={42} strokeWidth={4} showSubtext={false} />
                        <PriorityBadge priority={lead.priority} size="sm" />
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                        {lead.companyName}
                      </div>
                      <div className="text-xs text-slate-400">{lead.location}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800/80 text-xs text-slate-300 border border-slate-700/50">
                        {lead.industry}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-200">
                      {formatCurrency(lead.revenue)}
                    </td>
                    <td className="py-4 px-5 text-slate-300">
                      {lead.employees ? `${lead.employees} employees` : '—'}
                    </td>
                    <td className="py-4 px-5">
                      {lead.contact?.name ? (
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            {lead.contact.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{lead.contact.title}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unspecified</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead._id}`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-300 border border-slate-700/70 transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
