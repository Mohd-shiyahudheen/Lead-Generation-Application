import React from 'react';
import { LeadSignals } from '../types';

interface ScoreBreakdownBarProps {
  signals: LeadSignals;
  reasons?: string[];
}

export const ScoreBreakdownBar: React.FC<ScoreBreakdownBarProps> = ({ signals, reasons = [] }) => {
  const factors = [
    {
      key: 'revenueFit',
      name: 'Revenue Fit',
      weight: 25,
      val: signals?.revenueFit ?? 0,
      earned: Math.round((signals?.revenueFit ?? 0) * 25),
      color: 'bg-emerald-500',
      reasonMatcher: 'Revenue',
    },
    {
      key: 'industryFit',
      name: 'Industry Fit',
      weight: 20,
      val: signals?.industryFit ?? 0,
      earned: Math.round((signals?.industryFit ?? 0) * 20),
      color: 'bg-sky-500',
      reasonMatcher: 'Industry',
    },
    {
      key: 'employeeFit',
      name: 'Employee Count Fit',
      weight: 20,
      val: signals?.employeeFit ?? 0,
      earned: Math.round((signals?.employeeFit ?? 0) * 20),
      color: 'bg-indigo-500',
      reasonMatcher: 'Employee',
    },
    {
      key: 'growthSignal',
      name: 'Growth Signal',
      weight: 20,
      val: signals?.growthSignal ?? 0,
      earned: Math.round((signals?.growthSignal ?? 0) * 20),
      color: 'bg-purple-500',
      reasonMatcher: 'growth',
    },
    {
      key: 'dataCompleteness',
      name: 'Data Completeness',
      weight: 15,
      val: signals?.dataCompleteness ?? 0,
      earned: Math.round((signals?.dataCompleteness ?? 0) * 15),
      color: 'bg-cyan-500',
      reasonMatcher: 'completeness',
    },
  ];

  return (
    <div className="space-y-4">
      {factors.map((factor) => {
        const factorReason = reasons.find((r) =>
          r.toLowerCase().includes(factor.reasonMatcher.toLowerCase())
        );

        return (
          <div key={factor.key} className="space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{factor.name}</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-bold text-slate-100">{factor.earned}</span>
                <span className="text-slate-500">/ {factor.weight} pts</span>
              </div>
            </div>

            {/* Progress track */}
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${factor.color} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.round(factor.val * 100))}%` }}
              />
            </div>

            {/* Factor reason */}
            {factorReason && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1">
                <span className="text-brand-400 font-bold">•</span>
                <span>{factorReason}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
