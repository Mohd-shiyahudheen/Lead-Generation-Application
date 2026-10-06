import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchLeadById, explainLead } from '../api/client';
import { PriorityBadge } from '../components/PriorityBadge';
import { ScoreRing } from '../components/ScoreRing';
import { ScoreBreakdownBar } from '../components/ScoreBreakdownBar';
import { DealSignalList } from '../components/DealSignalList';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  ArrowLeft,
  Globe,
  Mail,
  Linkedin,
  Building,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Bot,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [customExplanation, setCustomExplanation] = useState<{
    text: string;
    source: 'ai' | 'deterministic';
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLeadById(id!),
    enabled: !!id,
  });

  const explainMutation = useMutation({
    mutationFn: () => explainLead(id!),
    onSuccess: (res) => {
      setCustomExplanation({
        text: res.explanation,
        source: res.source,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400 bg-rose-950/20 rounded-2xl border border-rose-900/50 max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
        <p className="font-semibold">Unable to load lead details</p>
        <button
          onClick={() => navigate('/leads')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const { lead, dealSignals } = data;

  const formatCurrency = (val?: number | null) => {
    if (!val) return 'Undisclosed';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Prioritized Leads</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800 shadow-xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{lead.companyName}</h1>
            <PriorityBadge priority={lead.priority} size="md" />
          </div>

          <p className="text-sm text-slate-400 max-w-2xl">{lead.description || 'No description provided.'}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-semibold text-slate-200">
              {lead.industry}
            </span>
            <span className="text-slate-400">{lead.location}</span>
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Website</span>
              </a>
            )}
            {lead.foundedYear && (
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Founded {lead.foundedYear}</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Score Gauge */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 shrink-0 shadow-inner">
          <ScoreRing score={lead.score} size={90} strokeWidth={8} />
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
              ICP Compatibility
            </div>
            <div className="text-lg font-black text-white mt-0.5">
              {lead.priority === 'A' ? 'Prime Fit' : lead.priority === 'B' ? 'High Match' : lead.priority === 'C' ? 'Moderate' : 'Low Match'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Top percentile candidate
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Financial Metrics & Decision Maker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Financial Profile */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-400" />
            <span>Financial & Company Metrics</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Estimated Revenue</span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {formatCurrency(lead.revenue)}
              </div>
              {lead.revenueGrowthPercent !== null && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{lead.revenueGrowthPercent}% annual growth</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Full-Time Employees</span>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {lead.employees ?? 'Unknown'}
              </div>
              {lead.employeeGrowthPercent !== null && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold mt-1">
                  <Users className="w-3 h-3" />
                  <span>+{lead.employeeGrowthPercent}% headcount growth</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Executive Contact Card */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Key Executive & Decision Maker</span>
          </h2>

          {lead.contact?.name ? (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{lead.contact.name}</h3>
                <p className="text-xs text-brand-400 font-semibold">{lead.contact.title}</p>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
                {lead.contact.email && (
                  <a
                    href={`mailto:${lead.contact.email}`}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.contact.email}</span>
                  </a>
                )}
                {lead.contact.linkedin && (
                  <a
                    href={lead.contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center text-slate-400 text-xs">
              Direct executive contact not yet discovered. Enrichment recommended.
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendation & Actionable Intelligence Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 border border-brand-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Acquisition Thesis & Recommended Action</span>
                {customExplanation && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {customExplanation.source === 'ai' ? 'AI Generated' : 'Deterministic Intelligence'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Actionable rationale and next steps for your acquisition pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => explainMutation.mutate()}
              disabled={explainMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition-all shadow-md shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>{explainMutation.isPending ? 'Generating...' : 'Generate AI Recommendation'}</span>
            </button>
          </div>
        </div>

        {/* Recommendation Text Box */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 relative group">
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {customExplanation
              ? customExplanation.text
              : `${lead.companyName} demonstrates a strong fit (${lead.score}/100) based on targeted revenue range and matched industry criteria. Recommended action: ${
                  lead.priority === 'A'
                    ? `Initiate personalized outreach to ${lead.contact?.name || 'the executive team'} to explore acquisition appetite.`
                    : lead.priority === 'B'
                    ? 'Place on acquisition shortlist and conduct preliminary tech stack validation.'
                    : 'Monitor for further signals or re-evaluate with broader parameters.'
                }`}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Recommended Action:{' '}
                <strong className="text-slate-100">
                  {lead.priority === 'A' ? 'Immediate Executive Outreach' : lead.priority === 'B' ? 'Add to Shortlist' : 'Monitor'}
                </strong>
              </span>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  customExplanation ? customExplanation.text : `${lead.companyName} thesis`
                )
              }
              className="flex items-center gap-1.5 text-slate-400 hover:text-brand-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Recommendation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Deal Signals Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Deal Signals Checklist</h2>
          <p className="text-xs text-slate-400">
            Structured indicators evaluating operational readiness, financial health, and ICP criteria
          </p>
        </div>
        <DealSignalList signals={dealSignals} />
      </div>

      {/* Factor Score Breakdown Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">Explainable Factor Breakdown</h2>
          <p className="text-xs text-slate-400">
            Every point is computed deterministically with transparent justification
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-panel">
          <ScoreBreakdownBar signals={lead.signals} reasons={lead.scoreReasons} />
        </div>
      </div>
    </div>
  );
};
