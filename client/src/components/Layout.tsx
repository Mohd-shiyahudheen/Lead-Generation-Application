import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeLeads, resetDemoDataset } from '../api/client';

export const Layout: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const analyzeMutation = useMutation({
    mutationFn: analyzeLeads,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      showToast(`⚡ ${data.message}`);
    },
    onError: () => {
      showToast('❌ Re-scoring failed');
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetDemoDataset,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      showToast(`🔄 ${data.message}`);
    },
    onError: () => {
      showToast('❌ Reset failed');
    },
  });

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Prioritized Leads', to: '/leads', icon: Target },
    { name: 'ICP Definition', to: '/icp', icon: SlidersHorizontal },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/leads/')) return 'Lead Intelligence Profile';
    if (location.pathname.startsWith('/leads')) return 'Prioritized Acquisition Targets';
    if (location.pathname.startsWith('/icp')) return 'Ideal Customer Profile (ICP)';
    return 'Lead Intelligence Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 overflow-hidden">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-brand-500/40 text-sm font-medium text-slate-100 shadow-2xl shadow-brand-500/20 animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  SaaSquatch <span className="text-brand-400 font-black">Signal</span>
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Lead Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspaces
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Controls */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950">
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 transition-all disabled:opacity-50"
            title="Recompute deterministic scores against active ICP"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{analyzeMutation.isPending ? 'Analyzing...' : 'Re-Score All Leads'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset leads to default 28 seed dataset?')) {
                resetMutation.mutate();
              }
            }}
            disabled={resetMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all disabled:opacity-50"
            title="Reset database to 28 fictional company profiles"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="pt-2 border-t border-slate-900">
            <a
              href="https://www.saasquatchleads.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-300 py-1"
            >
              <span>Reference: SaaSquatch Leads</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Engine Status: Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
