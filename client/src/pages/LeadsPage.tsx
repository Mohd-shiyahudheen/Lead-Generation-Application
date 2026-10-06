import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchLeads } from '../api/client';
import { PriorityBadge } from '../components/PriorityBadge';
import { ScoreRing } from '../components/ScoreRing';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const LeadsPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to page 1 on new search
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'leads',
      { page, limit, search: debouncedSearch, priority: priorityFilter, industry: industryFilter, sortBy, sortOrder },
    ],
    queryFn: () =>
      fetchLeads({
        page,
        limit,
        search: debouncedSearch || undefined,
        priority: priorityFilter || undefined,
        industry: industryFilter || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const formatCurrency = (val?: number | null) => {
    if (!val) return '—';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  const priorityTabs = [
    { label: 'All Targets', value: '' },
    { label: 'Tier A (High)', value: 'A' },
    { label: 'Tier B (Good)', value: 'B' },
    { label: 'Tier C (Review)', value: 'C' },
    { label: 'Tier D (Low)', value: 'D' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Prioritized Acquisition Targets</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked and categorized according to the multi-factor explainable scoring engine
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, decision makers, industries, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Industry dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <select
                value={industryFilter}
                onChange={(e) => {
                  setIndustryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Industries</option>
                <option value="SaaS">SaaS / Software</option>
                <option value="Cloud">Cloud Infrastructure</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare IT</option>
                <option value="E-commerce">E-commerce</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full md:w-44">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                  setPage(1);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="revenue-desc">Highest Revenue</option>
                <option value="revenue-asc">Lowest Revenue</option>
                <option value="employees-desc">Largest Team</option>
                <option value="companyName-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Priority Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Tier Filter:</span>
          </span>
          {priorityTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setPriorityFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === tab.value
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {(priorityFilter || industryFilter || searchTerm) && (
            <button
              onClick={() => {
                setPriorityFilter('');
                setIndustryFilter('');
                setSearchTerm('');
                setPage(1);
              }}
              className="text-xs text-brand-400 hover:text-brand-300 underline ml-auto font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No Matching Leads Found"
          description="Try broadening your search query or removing active tier/industry filters."
          actionText="Clear All Filters"
          onAction={() => {
            setSearchTerm('');
            setPriorityFilter('');
            setIndustryFilter('');
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-5">Score & Tier</th>
                    <th className="py-3.5 px-5">Company</th>
                    <th className="py-3.5 px-5">Industry</th>
                    <th className="py-3.5 px-5">Annual Revenue</th>
                    <th className="py-3.5 px-5">Employees</th>
                    <th className="py-3.5 px-5">Growth Signal</th>
                    <th className="py-3.5 px-5">Decision Maker</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.data.map((lead) => (
                    <tr
                      key={lead._id}
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="hover:bg-slate-850/60 cursor-pointer transition-colors group"
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
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700/60">
                          {lead.industry}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-200">
                        {formatCurrency(lead.revenue)}
                      </td>
                      <td className="py-4 px-5 text-slate-300">
                        {lead.employees ? `${lead.employees}` : '—'}
                      </td>
                      <td className="py-4 px-5">
                        {lead.revenueGrowthPercent ? (
                          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+{lead.revenueGrowthPercent}% rev</span>
                          </div>
                        ) : lead.foundedYear ? (
                          <span className="text-xs text-slate-400">Est. {lead.foundedYear}</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {lead.contact?.name ? (
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{lead.contact.name}</div>
                            <div className="text-[11px] text-slate-400">{lead.contact.title}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not found</span>
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
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div>
              Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(page * limit, data.total)}
              </span>{' '}
              of <span className="font-semibold text-slate-200">{data.total}</span> leads
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-200">
                Page {page} of {data.totalPages || 1}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
