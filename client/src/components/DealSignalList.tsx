import React from 'react';
import { DealSignal } from '../types';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface DealSignalListProps {
  signals: DealSignal[];
}

export const DealSignalList: React.FC<DealSignalListProps> = ({ signals }) => {
  if (!signals || signals.length === 0) {
    return <p className="text-sm text-slate-500">No deal signals recorded.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signals.map((signal) => {
        const isAcquisition = signal.key === 'acquisition_fit';

        return (
          <div
            key={signal.key}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
              signal.met
                ? isAcquisition
                  ? 'bg-gradient-to-r from-emerald-950/40 to-sky-950/40 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-emerald-950/20 border-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800/80 opacity-60'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {signal.met ? (
                isAcquisition ? (
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )
              ) : (
                <XCircle className="w-5 h-5 text-slate-500" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    signal.met ? 'text-slate-100' : 'text-slate-400'
                  }`}
                >
                  {signal.label}
                </span>
                {isAcquisition && signal.met && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MATCH
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{signal.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
